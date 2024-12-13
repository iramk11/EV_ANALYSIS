// Data from the hardcoded variable
const data = {
  "total_phev": 44611,
  "total_bev": 165554,
  "makes": {
    "BEV": {
      "ACURA": 61,
      "ALFA ROMEO": 0,
      "AUDI": 2308,
      "AZURE DYNAMICS": 4,
      "BENTLEY": 0,
      "BMW": 3273,
      "CADILLAC": 742,
      "CHEVROLET": 10604,
      "CHRYSLER": 0,
      "DODGE": 0,
      "FIAT": 803,
      "FISKER": 175,
      "FORD": 7453,
      "GENESIS": 281,
      "GMC": 167,
      "HONDA": 475,
      "HYUNDAI": 5175,
      "JAGUAR": 237,
      "JEEP": 0,
      "KIA": 6774,
      "LAND ROVER": 0,
      "LEXUS": 371,
      "LINCOLN": 0,
      "LUCID": 304,
      "MAZDA": 10,
      "MERCEDES-BENZ": 1544,
      "MINI": 813,
      "MITSUBISHI": 57,
      "NISSAN": 14721,
      "POLESTAR": 1171,
      "PORSCHE": 719,
      "RAM": 2,
      "RIVIAN": 5883,
      "ROLLS-ROYCE": 2,
      "SMART": 246,
      "SUBARU": 1340,
      "TESLA": 91379,
      "TH!NK": 5,
      "TOYOTA": 1023,
      "VINFAST": 1,
      "VOLKSWAGEN": 5783,
      "VOLVO": 1648,
      "WHEEGO ELECTRIC CARS": 0
    },
    "PHEV": {
      "ACURA": 0,
      "ALFA ROMEO": 84,
      "AUDI": 1669,
      "AZURE DYNAMICS": 0,
      "BENTLEY": 5,
      "BMW": 5334,
      "CADILLAC": 90,
      "CHEVROLET": 4815,
      "CHRYSLER": 3738,
      "DODGE": 682,
      "FIAT": 0,
      "FISKER": 13,
      "FORD": 3685,
      "GENESIS": 0,
      "GMC": 0,
      "HONDA": 863,
      "HYUNDAI": 893,
      "JAGUAR": 0,
      "JEEP": 5501,
      "KIA": 2802,
      "LAND ROVER": 72,
      "LEXUS": 430,
      "LINCOLN": 308,
      "LUCID": 0,
      "MAZDA": 751,
      "MERCEDES-BENZ": 422,
      "MINI": 216,
      "MITSUBISHI": 979,
      "NISSAN": 0,
      "POLESTAR": 0,
      "PORSCHE": 540,
      "RAM": 0,
      "RIVIAN": 0,
      "ROLLS-ROYCE": 0,
      "SMART": 0,
      "SUBARU": 66,
      "TESLA": 0,
      "TH!NK": 0,
      "TOYOTA": 7225,
      "VINFAST": 0,
      "VOLKSWAGEN": 0,
      "VOLVO": 3425,
      "WHEEGO ELECTRIC CARS": 3
    }
  }
};


// Chart dimensions and setup
const width = 700;
const height = 700;
const radius = Math.min(width, height) / 2 - 50;

const svg = d3.select("#plot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Add tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "#f9f9f9")
  .style("border", "1px solid #ccc")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
  .style("pointer-events", "none")
  .style("display", "none");

// Add "Back" button
const backButton = svg.append("text")
  .attr("x", width / 2)
  .attr("y", height - 50)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("cursor", "pointer")
  .style("display", "none")
  .text("← Back to Main Chart")
  .on("click", () => {
    drawInitialChart();
  });

// Define color scales
const colorCategory = d3.scaleOrdinal(["#F8766D", "#00BFC4"]);
const colorMakes = d3.scaleOrdinal(d3.schemeSet3);

// Pie generator
const pie = d3.pie().value(d => d.value).sort(null);
const arc = d3.arc().innerRadius(0).outerRadius(radius);
const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

// Initial Pie Data
const initialData = [
  { category: "PHEV", value: data.total_phev },
  { category: "BEV", value: data.total_bev }
];

// Draw legend
function drawLegend(colors, labels) {
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, ${height / 3 - labels.length * 10})`);

  legend.selectAll("rect")
    .data(labels)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", (d, i) => colors(i));

  legend.selectAll("text")
    .data(labels)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 10)
    .style("font-size", "12px")
    .text(d => d);
}

// Draw pie chart
function drawChart(data, colors, isDetailed) {
  const arcs = pie(data);

  const paths = g.selectAll("path")
    .data(arcs);

  paths.enter()
    .append("path")
    .merge(paths)
    .attr("d", arc)
    .attr("fill", (d, i) => colors(i))
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arcHover);
      tooltip.style("display", "block")
        .html(`<strong>${d.data.category}</strong><br>Count: ${d.data.value}`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).transition().duration(200).attr("d", arc);
      tooltip.style("display", "none");
    })
    .on("click", (event, d) => {
      if (!isDetailed) drawDetailedChart(d.data.category);
    });

  paths.exit().remove();

  // Show or hide "Back" button
  backButton.style("display", isDetailed ? "block" : "none");
}

// Draw initial chart
function drawInitialChart() {
  g.selectAll("path").remove();
  svg.selectAll("g.legend").remove();
  drawChart(initialData, colorCategory, false);
  drawLegend(colorCategory, ["PHEV", "BEV"]);
}

// Draw detailed chart
function drawDetailedChart(category) {
  const makesData = Object.entries(data.makes[category]).map(([make, value]) => ({
    category: make,
    value: value
  }));

  g.selectAll("path").remove();
  svg.selectAll("g.legend").remove();
  drawChart(makesData, colorMakes, true);
  drawLegend(colorMakes, makesData.map(d => d.category));
}


// Render initial chart
drawInitialChart();