// Parameters
let selectedYear = null;
let selectedPlayer = null;

// Define the URL for the CSV data source
const dataURL = 'https://raw.githubusercontent.com/feram18/mlb-narrative-visualization/main/mlb-stats.csv'; // Replace with the actual URL

// Load data from the URL using fetch
fetch(dataURL)
  .then(response => response.text())
  .then(csvData => {
    // Parse the CSV data
    const data = d3.csvParse(csvData);

    // Convert numerical columns to numbers
    data.forEach(d => {
      d.AB = +d.AB;
      d.PA = +d.PA;
      // Add more conversions for other numerical columns if needed
    });

    // Process the data further as needed

    // Call the main function to create the visualization
    createVisualization(data);
  });


function createVisualization(data) {
  // Define the main SVG container
  const svg = d3.select("#visualization").append("svg")
    .attr("width", 800)
    .attr("height", 500);

  // Implement the initial overview scene
  function showOverviewScene() {
    // Clear the SVG and show the overview scene
    svg.selectAll("*").remove();

    // Add code here to create the overview scene, e.g., bar chart for average AVG by year
    // Add interaction to trigger the drill-down scene when a year is clicked

    // Example: Show a message for the overview scene
    svg.append("text")
      .attr("x", 400)
      .attr("y", 250)
      .attr("text-anchor", "middle")
      .text("Overview Scene - Click on a year to drill down");
  }

  // Implement the drill-down scene
  function showDrillDownScene(year) {
    // Clear the SVG and show the drill-down scene for the selected year
    svg.selectAll("*").remove();

    // Add code here to create the drill-down scene, e.g., table showing players' AVG for the selected year
    // Add interaction to allow users to select a player and trigger the individual player scene

    // Example: Show a message for the drill-down scene
    svg.append("text")
      .attr("x", 400)
      .attr("y", 250)
      .attr("text-anchor", "middle")
      .text(`Drill-Down Scene for Year ${year}`);
  }

  // Implement the individual player scene
  function showIndividualPlayerScene(player) {
    // Clear the SVG and show the scene for the selected player
    svg.selectAll("*").remove();

    // Add code here to create the individual player scene, e.g., line chart showing player's AVG over time
    // Add interaction to allow users to navigate back to the drill-down scene or overview scene

    // Example: Show a message for the individual player scene
    svg.append("text")
      .attr("x", 400)
      .attr("y", 250)
      .attr("text-anchor", "middle")
      .text(`Individual Player Scene for ${player}`);
  }

  // Define triggers for user interactions
  function triggerDrillDown(year) {
    selectedYear = year;
    showDrillDownScene(year);
  }

  function triggerShowPlayer(player) {
    selectedPlayer = player;
    showIndividualPlayerScene(player);
  }

  function triggerBackToDrillDown() {
    showDrillDownScene(selectedYear);
  }

  function triggerBackToOverview() {
    selectedYear = null;
    selectedPlayer = null;
    showOverviewScene();
  }

  // Show the initial overview scene
  showOverviewScene();
}
