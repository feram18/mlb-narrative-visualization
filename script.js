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
  const svgHeightPercentage = 0.6;

  const viewHeight = window.innerHeight;

  const margin = {
    top: 70,
    right: 50,
    bottom: 80,
    left: 70
  };

  const containerWidth = document.getElementById("visualization").offsetWidth;

  const svgWidth = containerWidth - containerWidth * 0.30;
  const svgHeight = viewHeight * svgHeightPercentage;

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3.select("#visualization").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
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
      .attr("font-size", 12);

    // Create and display the Y-axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 12);

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
      .on("click", (event, d) => triggerDrillDown(d.year))
      .on("mouseover", raiseBar)
      .on("mouseout", resetBar);

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

    function raiseBar(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("y", d => yScale(d.avgAVG) - 10);
    }
    
    function resetBar(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("y", d => yScale(d.avgAVG));
    }
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
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 12);

    // Create and display the Y-axis for Batting AVG
    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 12);

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
      .on("mouseover", showPlayerInfoAndEnlargePoint)
      .on("mouseout", hidePlayerInfoAndResetPoint)
      .on("click", (event, d) => triggerShowPlayer(d));

    function showPlayerInfoAndEnlargePoint(event, d) {
      const xPosition = xScale(d.swing_percent) + 10;
      const yPosition = yScale(d.batting_avg) - 5;

      // Enlarge the scatterplot point on mouseover
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 8);
    
      const tooltipText = `${d.first_name} ${d.last_name}\nAVG: ${d.batting_avg}\nSwing %: ${d.swing_percent}\nStrikeouts: ${d.strikeout}\nStrikeout %: ${d.k_percent}\nWalks: ${d.walk}\nWalk %: ${d.bb_percent}\nSLG %: ${d.slg_percent}\nOBP: ${d.on_base_percent}`;
      const lineHeight = 16;
      const padding = 5;
    
      const bbox = svg.append("text")
        .attr("class", "player-stats")
        .attr("x", xPosition + padding)
        .attr("y", yPosition + padding)
        .attr("dy", "0.35em")
        .selectAll("tspan")
        .data(tooltipText.split("\n"))
        .enter()
        .append("tspan")
        .attr("x", xPosition + padding)
        .attr("dy", (d, i) => i === 0 ? lineHeight : lineHeight)
        .text(d => d)
        .node()
        .getBBox();
    
      svg.insert("rect", ".player-stats") // Insert rect behind text
        .attr("class", "player-stats-background")
        .attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + 2 * padding)
        .attr("height", bbox.height + 2 * padding)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", "white");
    }

    function hidePlayerInfoAndResetPoint() {
      svg.selectAll(".annotation-text").remove();
      svg.selectAll(".player-stats").remove();
      svg.selectAll(".player-stats-background").remove();
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 5);
    }

    const titleY = -margin.top / 2;
    const buttonY = titleY;

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", titleY)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Batting Statistics for ${year}`);

    // X and Y axis labels
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
      .style("cursor", "pointer")
      .on("click", triggerBackToOverview);
    
    backButton.append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "lightgray")
      .attr("rx", 8)
      .attr("x", 10)
      .attr("y", buttonY);
    
    backButton.append("text")
      .attr("x", 60)
      .attr("y", buttonY + 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "14px")
      .text("< OVERVIEW");

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

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 12);

    const yAxis = d3.axisLeft(yScale).ticks(6);
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 12);

    // Hits distribution chart bars
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

    const titleY = -margin.top / 2;
    const buttonY = titleY;

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", titleY)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`${player.first_name} ${player.last_name} Hit Distribution in ${player.year}`);

    // Add X and Y axis labels for hits distribution chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .text("Type");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Hits");

    // Add Back button to go back to the drill-down scene
    const backButton = svg.append("g")
      .attr("class", "back-button")
      .style("cursor", "pointer")
      .on("click", triggerBackToDrillDown);

    backButton.append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "lightgray")
      .attr("rx", 8)
      .attr("x", 10)
      .attr("y", buttonY);

    backButton.append("text")
      .attr("x", 60)
      .attr("y", buttonY + 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "14px")
      .text(`< BACK TO ${player.year}`);
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