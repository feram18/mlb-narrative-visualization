// Parameters
let selectedYear = null;
let selectedPlayer = null;

const dataURL = 'https://raw.githubusercontent.com/feram18/mlb-narrative-visualization/main/mlb-stats.csv';

fetch(dataURL)
  .then(response => response.text())
  .then(csvData => {
    const data = d3.csvParse(csvData, d => {
      d.AB = +d.AB;
      d.PA = +d.PA;
      d.batting_avg = d.batting_avg ? +d.batting_avg : 0;
      return d;
    });

    createVisualization(data);
  });

function createVisualization(data) {
  const margin = {
    top: 70,
    right: 50,
    bottom: 80,
    left: 70
  };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#visualization").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = Array.from(new Set(data.map(d => d.year)));
  const colorScale = d3.scaleOrdinal()
    .domain(years)
    .range(d3.schemePaired);

  function showOverviewScene() {
    svg.selectAll("*").remove();

    // Aggregate data for each year
    const yearAverages = years.map(year => {
      const yearData = data.filter(d => d.year === year);
      const avgAVG = d3.mean(yearData, d => d.batting_avg);
      return {
        year,
        avgAVG
      };
    });

    // Create the X and Y scales
    const xScale = d3.scaleBand()
      .domain(yearAverages.map(d => d.year))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yearAverages, d => d.avgAVG)])
      .range([height, 0]);

    // Create and display the X-axis
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    // Create and display the Y-axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Create the bars for each year
    const bars = svg.selectAll(".bar")
      .data(yearAverages)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.avgAVG))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.avgAVG))
      .attr("fill", d => colorScale(d.year))
      .on("click", (event, d) => triggerDrillDown(d.year));

    // Add AVG values at the top of the bars
    svg.selectAll(".bar-label")
      .data(yearAverages)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.avgAVG) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.avgAVG.toFixed(3));

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("Average 'Batting Average (AVG)' by Year");

    // Add X and Y axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Average AVG");
  }

  function showDrillDownScene(year) {
    svg.selectAll("*").remove();

    // Filter the data to get the players for the selected year
    const yearPlayers = data.filter(d => d.year === year);

    // Calculate the minimum and maximum values for Swing % and Batting AVG
    const swingPercentExtent = d3.extent(yearPlayers, d => d.swing_percent);
    const battingAvgExtent = d3.extent(yearPlayers, d => d.batting_avg);

    // Create the X and Y scales for Swing % and Batting AVG
    const xScale = d3.scaleLinear()
      .domain(swingPercentExtent)
      .range([0, width])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(battingAvgExtent)
      .range([height, 0])
      .nice();

    // Create and display the X-axis for Swing %
    const xAxis = d3.axisBottom(xScale).ticks(6);
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    // Create and display the Y-axis for Batting AVG
    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    const pointGroup = svg.append("g")
      .attr("class", "point-group");

    // Create the scatter plot points for each player
    const points = pointGroup.selectAll(".point")
      .data(yearPlayers)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.swing_percent))
      .attr("cy", d => yScale(d.batting_avg))
      .attr("r", 5)
      .attr("fill", d => colorScale(year))
      .on("mouseover", showPlayerName)
      .on("mouseout", hidePlayerName)
      .on("click", (event, d) => triggerShowPlayer(d));

    function showPlayerName(event, d) {
      const xPosition = xScale(d.swing_percent) + 10;
      const yPosition = yScale(d.batting_avg) - 5;

      svg.append("text")
        .attr("class", "annotation-text")
        .attr("x", xPosition)
        .attr("y", yPosition)
        .attr("dy", "0.35em")
        .text(`${d.first_name} ${d.last_name}`);
    }

    function hidePlayerName() {
      svg.select(".annotation-text").remove();
    }

    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Batting Statistics for ${year}`);

    // Add X and Y axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("Swing %");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Batting AVG");

    // Add Back button to go back to the Overview scene
    const backButton = svg.append("g")
      .attr("class", "back-button")
      .attr("transform", `translate(10, ${-margin.top / 2})`)
      .style("cursor", "pointer")
      .on("click", triggerBackToOverview);

    backButton.append("rect")
      .attr("width", 60)
      .attr("height", 25)
      .attr("fill", "lightgray")
      .attr("rx", 5);

    backButton.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("< Overview");

    const maxHomeRunsPlayer = getMaxPlayer(yearPlayers, "home_run");
    const maxWalksPlayer = getMaxPlayer(yearPlayers, "walk");
    const maxStrikeoutsPlayer = getMaxPlayer(yearPlayers, "strikeout");
  
    function getMaxPlayer(players, stat) {
      // Sort the players in descending order based on the specified stat
      const sortedPlayers = players.slice().sort((a, b) => b[stat] - a[stat]);
      // Get the player with the highest value for the specified stat
      return sortedPlayers[0];
    }

    const annotations = [
      {
        note: {
          title: `Most Home Runs: ${maxHomeRunsPlayer.home_run}`,
          label: `${maxHomeRunsPlayer.first_name} ${maxHomeRunsPlayer.last_name}`,
          wrap: 190,
        },
        connector: {
          end: "dot",
          type: "line",
        },
        data: { swing_percent: maxHomeRunsPlayer.swing_percent, batting_avg: maxHomeRunsPlayer.batting_avg },
        dy: -30,
        dx: -30,
        subject: {
          radius: 5,
        },
        align: "dynamic",
      },
    
      {
        note: {
          title: `Most Strikeouts: ${maxStrikeoutsPlayer.strikeout}`,
          label: `${maxStrikeoutsPlayer.first_name} ${maxStrikeoutsPlayer.last_name}`,
          wrap: 190,
        },
        connector: {
          end: "dot",
          type: "line",
        },
        data: { swing_percent: maxStrikeoutsPlayer.swing_percent, batting_avg: maxStrikeoutsPlayer.batting_avg },
        dy: 30,
        dx: -30,
        subject: {
          radius: 5,
        },
        align: "dynamic",
      },
    
      {
        note: {
          title: `Most Walks: ${maxWalksPlayer.walk}`,
          label: `${maxWalksPlayer.first_name} ${maxWalksPlayer.last_name}`,
          wrap: 190,
        },
        connector: {
          end: "dot",
          type: "line",
        },
        data: { swing_percent: maxWalksPlayer.swing_percent, batting_avg: maxWalksPlayer.batting_avg },
        dy: -30,
        dx: 30,
        subject: {
          radius: 5,
        },
        align: "dynamic",
      },
    ];

    const makeAnnotations = d3.annotation()
      .annotations(annotations)
      .type(d3.annotationCalloutCircle)
      .accessors({
        x: d => xScale(d.swing_percent),
        y: d => yScale(d.batting_avg),
      })
      .accessorsInverse({
        swing_percent: d => xScale.invert(d.x),
        batting_avg: d => yScale.invert(d.y),
      })
      .textWrap(190)
      .notePadding(10);

    svg.append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);
  }

  function showIndividualPlayerScene(year, player) {
    svg.selectAll("*").remove();

    // Hits distribution
    const hitsData = [{
        type: "Single",
        count: player.single
      },
      {
        type: "Double",
        count: player.double
      },
      {
        type: "Triple",
        count: player.triple
      },
      {
        type: "Home Run",
        count: player.home_run
      },
    ];

    const xScale = d3.scaleBand()
      .domain(hitsData.map(d => d.type))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(player.single, player.double, player.triple, player.home_run)])
      .range([height, 0]);

    // Create and display axes
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Create the bars for the hits distribution chart
    const bars = svg.selectAll(".bar")
      .data(hitsData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.type))
      .attr("y", d => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.count))
      .attr("fill", "steelblue");

    // Add count labels
    svg.selectAll(".bar-label")
      .data(hitsData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", d => xScale(d.type) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.count) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.count);

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`${player.first_name} ${player.last_name} Batting Statistics in ${player.year}`);

    // Add X and Y axis labels for hits distribution chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("Hits Type");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Number of Hits");

    // Add Back button to go back to the drill-down scene
    const backButton = svg.append("g")
      .attr("class", "back-button")
      .attr("transform", `translate(10, ${-margin.top / 2})`)
      .style("cursor", "pointer")
      .on("click", triggerBackToDrillDown);

    backButton.append("rect")
      .attr("width", 60)
      .attr("height", 25)
      .attr("fill", "lightgray")
      .attr("rx", 5);

    backButton.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Back");
  }

  function triggerDrillDown(year) {
    selectedYear = year;
    showDrillDownScene(year);
  }

  function triggerShowPlayer(player) {
    selectedPlayer = player;
    showIndividualPlayerScene(selectedYear, player);
  }

  function triggerBackToDrillDown() {
    showDrillDownScene(selectedYear);
  }

  function triggerBackToOverview() {
    selectedYear = null;
    selectedPlayer = null;
    showOverviewScene();
  }

  showOverviewScene();
}