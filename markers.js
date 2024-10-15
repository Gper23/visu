// // Función para asignar colores según los géneros principales
// function getGenreColor(genre) {
//   const genreColors = {
//     Drama: "blue",
//     History: "green",
//     Action: "red",
//     Adventure: "orange",
//     "Science Fiction": "purple",
//     Comedy: "yellow",
//     Romance: "pink",
//     Thriller: "gray",
//     Fantasy: "lightgreen",
//     // Agrega más géneros aquí con sus respectivos colores
//     Other: "black",
//   };
//   return genreColors[genre] || genreColors["Other"];
// }

// // Modificar la función createChart para aplicar colores según géneros
// function createChart(movies) {
//   const years = movies.map((m) => m.release_date.getFullYear());
//   const genres = movies.map((m) => m.genres[0]); // Usar el primer género de la lista
//   const colors = genres.map((genre) => getGenreColor(genre)); // Asignar colores

//   const traces = [
//     {
//       x: years,
//       y: movies.map((m) => m.vote_average),
//       text: movies.map((m) => `${m.original_title} (${m.genres.join(", ")})`),
//       name: "Calificación",
//       mode: "markers",
//       marker: {
//         color: colors,
//         size: 10,
//       },
//       hovertemplate:
//         "%{text}<br>Año: %{x}<br>Calificación: %{y:.1f}<extra></extra>",
//     },
//   ];

//   const layout = {
//     title: "Evolución del Estilo Cinematográfico por Género y Calificación",
//     xaxis: { title: "Año", type: "category" },
//     yaxis: { title: "Calificación" },
//     showlegend: false,
//     hovermode: "closest",
//   };

//   Plotly.newPlot("chart 2", traces, layout);
// }

// const response = await fetch("movies.csv");
// const data = await response.text();
// const movies = d3.csvParse(data, d3.autoType);
// createChart(movies);
