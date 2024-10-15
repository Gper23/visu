async function fetchMovieData(url) {
  try {
      const response = await fetch(url);
      const data = await response.text();
      
      const movies = d3.csvParse(data, d3.autoType);
      // console.log(movies);
      return movies.filter(movie => !isNaN(movie.vote_average) && !isNaN(movie.runtime) && !isNaN(movie.budget));
  }
  catch (error) {
      console.error("Error al cargar o procesar el CSV:", error);
      return [];
  }
}

// Función para crear el gráfico
function createChart(movies) {
  // Ordenar las películas por año de lanzamiento ascendente
  movies.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

  const years = movies.map(m => m.release_date.getFullYear());
  const titles = movies.map(m => m.original_title);
  
  const traces = [
      {
          x: years,
          y: movies.map(m => m.vote_average),
          text: titles,
          name: 'Calificación',
          type: 'scatter',
          mode: 'lines+markers',
          yaxis: 'y',
          hovertemplate: '%{text}<br>Año: %{x}<br>Calificación: %{y:.1f}<extra></extra>'
      },
      {
          x: years,
          y: movies.map(m => m.runtime),
          text: titles,
          name: 'Duración (minutos)',
          type: 'scatter',
          mode: 'lines+markers',
          yaxis: 'y2',
          hovertemplate: '%{text}<br>Año: %{x}<br>Duración: %{y} min<extra></extra>'
      },
      {
          x: years,
          y: movies.map(m => m.budget),
          text: titles,
          name: 'Presupuesto',
          type: 'scatter',
          mode: 'lines+markers',
          yaxis: 'y3',
          hovertemplate: '%{text}<br>Año: %{x}<br>Presupuesto: $%{y:,.0f}<extra></extra>'
      }
  ];

  const layout = {
      title: 'Evolución de las Películas a lo Largo de los Años',
      xaxis: { title: 'Año', type: 'category' },
      yaxis: { 
          title: 'Calificación',
          domain: [0, 0.3],
          tickformat: '.1f'
      },
      yaxis2: {
          title: 'Duración (minutos)',
          domain: [0.35, 0.65],
          tickformat: 'd'
      },
      yaxis3: {
          title: 'Presupuesto',
          domain: [0.7, 1],
          tickformat: '$.2s'
      },
      height: 900,
      showlegend: true,
      hovermode: 'closest',
      
  };

  Plotly.newPlot('chart', traces, layout);
}

// Función principal que orquesta todo el proceso
async function analyzeMovieTrends(csvUrl) {
  const movies = await fetchMovieData(csvUrl);
  if (movies.length > 0) {
      createChart(movies);
  } else {
      console.error("No se pudieron cargar los datos de las películas.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  analyzeMovieTrends('movies.csv');
});