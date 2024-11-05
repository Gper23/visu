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

let currentSound = null; // Variable para guardar el audio actual
let fadeOutIntervalId = null; // ID del intervalo de fundido

// Función para reproducir sonidos según el estado de la película
function playSound(movie) {
    // Si ya hay un sonido reproduciéndose, lo pausamos
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0; // Reinicia el sonido al inicio
    }

    // Crear un nuevo objeto de audio para el sonido correspondiente
    currentSound = new Audio(movie.oscar ? 'sound1.mp3' : 'sound2.mp3');
    currentSound.play();

    // Configurar duración de fundido y intervalo según el sonido
    let fadeOutDuration, fadeOutInterval;

    if (movie.oscar) {
        fadeOutDuration = 6500; // 6500 ms para sound1
        fadeOutInterval = 100; // 100 ms intervalo para sound1
    } else {
        fadeOutDuration = 6000; // 6000 ms para sound2
        fadeOutInterval = 200; // 200 ms intervalo para sound2
    }

    // Calcular cuántos pasos de reducción de volumen habrá
    const steps = fadeOutDuration / fadeOutInterval;
    const volumeDecrement = currentSound.volume / steps; // Cantidad a reducir en cada paso

    // Limitar a un único fundido por vez
    if (fadeOutIntervalId) {
        clearInterval(fadeOutIntervalId); // Limpiar el intervalo anterior si existe
    }

    // Detener el audio después de la duración total
    setTimeout(() => {
        // Comienza el proceso de fundido
        fadeOutIntervalId = setInterval(() => {
            if (currentSound.volume > 0) {
                currentSound.volume = Math.max(0, currentSound.volume - volumeDecrement); // Reducir el volumen
            } else {
                clearInterval(fadeOutIntervalId); // Detener el intervalo cuando el volumen llega a 0
                currentSound.pause(); // Detiene el sonido
                currentSound.currentTime = 0; // Reinicia el sonido al inicio
                currentSound = null; // Limpiar la variable actual
                fadeOutIntervalId = null; // Limpiar el ID del intervalo de fundido
            }
        }, fadeOutInterval);
    }, currentSound.duration * 1000 - fadeOutDuration); // Retardar el inicio del fade out
}

// Función para crear el gráfico
function createChart(movies) {
    // Ordenar las películas por año
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
            line: {
                color: 'black',
                width: 1
            }
        },
        hovertemplate: '%{text}<br>Año: %{x}<br>Calificación: %{y:.3f}<extra></extra>'
    };

    const layout = {
        title: 'Películas con Mejor Calificación por Año',
        xaxis: { title: 'Año' },
        yaxis: {
            title: 'Calificación Promedio',
            range: [0, 10]
        },
        paper_bgcolor: '#FEF3C7', // Color similar al fondo de la página
        plot_bgcolor: '#FEF3C7',  // Color similar al fondo de la página
        showlegend: false,
        hovermode: 'closest'
    };

    // Crear el gráfico
    Plotly.newPlot('chart', [trace], layout).then(() => {
        // Agregar evento de clic después de renderizar el gráfico
        const chartElement = document.getElementById('chart');
        chartElement.on('plotly_click', function(eventData) {
            const index = eventData.points[0].pointIndex;
            const selectedMovie = movies[index];
            playSound(selectedMovie); // Reproducir sonido al hacer clic
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
