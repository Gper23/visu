// Función para cargar y procesar los datos de las películas
async function fetchMovieData(url) {
    try {
      const response = await fetch(url);
      const data = await response.text();
      
      const movies = d3.csvParse(data, d3.autoType);
      return movies.filter(movie => !isNaN(movie.vote_average) && !isNaN(movie.vote_quantity));
    }
    catch (error) {
      console.error("Error al cargar o procesar el CSV:", error);
      return [];
    }
  }
  
  // Función para crear el gráfico
  function createChart(movies) {
    // Ordenar las películas por año
    movies.sort((a, b) => a.Año - b.Año);
  
    const trace = {
      x: movies.map(m => m.Año),
      y: movies.map(m => m.vote_average),
      text: movies.map(m => `${m.Película}<br>Director: ${m.Director}<br>País: ${m['País de nacimiento']}<br>Película extra: ${m['Película extra']}`),
      mode: 'markers',
      marker: {
        size: movies.map(m => Math.sqrt(m.vote_quantity) / 5),
        color: movies.map(m => m.Oscar ? 'yellow' : 'gray'),
        line: {
          color: 'black',
          width: 1
        }
      },
      hovertemplate: '%{text}<br>Año: %{x}<br>Calificación: %{y:.3f}<br>Votos: %{marker.size:.0f}<extra></extra>'
    };
  
    const layout = {
      title: 'Películas y sus calificaciones por año',
      xaxis: { title: 'Año' },
      yaxis: { 
        title: 'Calificación promedio',
        range: [0, 10]
      },
      showlegend: false,
      hovermode: 'closest'
    };
  
    Plotly.newPlot('chart', [trace], layout);
  }
  
  // Función principal
  async function analyzeMovieTrends(csvUrl) {
    const movies = await fetchMovieData(csvUrl);
    if (movies.length > 0) {
      createChart(movies);
    } else {
      console.error("No se pudieron cargar los datos de las películas.");
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    analyzeMovieTrends('final.csv');
  });