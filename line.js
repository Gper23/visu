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

  Plotly.newPlot('chart', [trace], layout);
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