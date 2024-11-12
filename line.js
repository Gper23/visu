// Función para cargar y procesar los datos de las películas
async function fetchMovieData(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        const movies = d3.csvParse(data);

        // Procesar y limpiar los datos
        const processedMovies = movies.map(movie => ({
            original_title: movie.original_title,
            release_date: +movie.release_date,
            Director: movie.Director,
            pais_nacimiento: movie['País de nacimiento'],
            pelicula_extra: movie['Película extra'],
            oscar: movie.oscar === 'True',
            vote_quantity: +movie.vote_quantity,
            vote_average: +movie.vote_average
        })).filter(movie => !isNaN(movie.vote_average) && !isNaN(movie.vote_quantity));

        return processedMovies;
    } catch (error) {
        console.error("Error al cargar o procesar el CSV:", error);
        return [];
    }
}

// Función para obtener la película con mejor calificación de cada año
function getTopRatedMoviesByYear(movies) {
    const topMoviesByYear = {};
    movies.forEach(movie => {
        const year = movie.release_date;
        if (!topMoviesByYear[year] || movie.vote_average > topMoviesByYear[year].vote_average) {
            topMoviesByYear[year] = movie;
        }
    });
    return Object.values(topMoviesByYear);
}

let backgroundSound = null; // Variable para el sonido de fondo
let currentSound = null; // Variable para el soundtrack actual
let fadeOutIntervalId = null; // ID del intervalo de fundido

// Función para reproducir sonido de fondo y soundtrack de la película
function playSound(movie) {
    // Pausar cualquier reproducción anterior
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
    }
    if (backgroundSound) {
        backgroundSound.pause();
        backgroundSound.currentTime = 0;
    }

    // Cargar y reproducir el sonido de fondo
    backgroundSound = new Audio(movie.oscar ? 'sound1.mp3' : 'sound2.mp3');
    backgroundSound.volume = 0.6;
    backgroundSound.play();

    // Cargar y reproducir el soundtrack de la película
    currentSound = new Audio(`soundtracks/${movie.original_title}.mp3`);
    currentSound.play();

    // Calcular la duración total para ambos audios y aplicar fundido
    const maxDuration = Math.max(backgroundSound.duration, currentSound.duration);
    applyFadeOutEffect(maxDuration);
}

// Función para aplicar efecto de fundido a ambos sonidos
function applyFadeOutEffect(duration) {
    const fadeOutDuration = 7500;  // Duración del fundido (ajustar si es necesario)
    const fadeOutInterval = 100;   // Intervalo de actualización del volumen

    const steps = fadeOutDuration / fadeOutInterval;
    const volumeDecrement = 1 / steps; // Decremento de volumen para ambos sonidos

    if (fadeOutIntervalId) {
        clearInterval(fadeOutIntervalId);
    }

    // Iniciar el fundido después de la duración de los audios
    setTimeout(() => {
        fadeOutIntervalId = setInterval(() => {
            // Reducir el volumen de ambos sonidos
            if (currentSound.volume > 0) {
                currentSound.volume = Math.max(0, currentSound.volume - volumeDecrement);
            }
            if (backgroundSound.volume > 0) {
                backgroundSound.volume = Math.max(0, backgroundSound.volume - volumeDecrement);
            }

            // Detener los audios una vez se haya terminado el fundido
            if (currentSound.volume <= 0 && backgroundSound.volume <= 0) {
                clearInterval(fadeOutIntervalId);
                currentSound.pause();
                currentSound.currentTime = 0;
                backgroundSound.pause();
                backgroundSound.currentTime = 0;
                currentSound = null;
                backgroundSound = null;
                fadeOutIntervalId = null;
            }
        }, fadeOutInterval);
    }, duration * 1000 - fadeOutDuration);  // Ajuste para que el fundido inicie al final de los audios
}

// Función para crear el gráfico
function createChart(movies) {
    movies.sort((a, b) => a.release_date - b.release_date);

    const trace = {
        x: movies.map(m => m.release_date),
        y: movies.map(m => m.vote_average),
        text: movies.map(m => 
            `${m.original_title}<br>Director: ${m.Director}<br>País: ${m.pais_nacimiento}<br>Película extra: ${m.pelicula_extra}<br>Votos: ${m.vote_quantity}`),
        mode: 'markers',
        marker: {
            size: movies.map(m => Math.sqrt(m.vote_quantity) / 5),
            color: movies.map(m => m.oscar ? 'yellow' : 'gray'),
            line: { color: 'black', width: 1 }
        },
        hovertemplate: '%{text}<br>Año: %{x}<br>Calificación: %{y:.3f}<extra></extra>'
    };

    const layout = {
        title: 'Películas con Mejor Calificación por Año',
        xaxis: { title: 'Año' },
        yaxis: { title: 'Calificación Promedio', range: [0, 10] },
        paper_bgcolor: '#FEF3C7',
        plot_bgcolor: '#FEF3C7',
        showlegend: false,
        hovermode: 'closest'
    };

    Plotly.newPlot('chart', [trace], layout).then(() => {
        const chartElement = document.getElementById('chart');
        chartElement.on('plotly_click', function(eventData) {
            const index = eventData.points[0].pointIndex;
            const selectedMovie = movies[index];
            playSound(selectedMovie);
        });
    });
}

// Función principal
async function analyzeMovieTrends(csvUrl) {
    const movies = await fetchMovieData(csvUrl);
    if (movies.length > 0) {
        const topMovies = getTopRatedMoviesByYear(movies);
        createChart(topMovies);
    } else {
        console.error("No se pudieron cargar los datos de las películas.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    analyzeMovieTrends('final.csv');
});
