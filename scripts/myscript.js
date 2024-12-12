// Set dimensions and margins
const margin = { top: 20, right: 30, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG container
const svg = d3.select("#scatterplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Add axis labels
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 5)
  .attr("text-anchor", "middle")
  .text("Base MSRP (in $)");

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -margin.left + 15)
  .attr("text-anchor", "middle")
  .text("Electric Range (in miles)");

// Scales
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Axes
const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
const yAxis = svg.append("g");

// Load the data
d3.csv("ev_data.csv").then(data => {
  // Cast data to numeric
  data.forEach(d => {
    d.BaseMSRP = +d.BaseMSRP;
    d.ElectricRange = +d.ElectricRange;
  });

  // Dropdown values (PHEV and BEV)
  const vehicleTypes = Array.from(new Set(data.map(d => d.ElectricVehicleType)));

  // Initialize dropdown
  const dropdown = d3.select("#dropdown")
    .selectAll("option")
    .data(vehicleTypes)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d);

  // Filter function
  const updateChart = (vehicleType) => {
    const filteredData = data.filter(d => d.ElectricVehicleType === vehicleType);

    // Update scales
    x.domain(d3.extent(filteredData, d => d.BaseMSRP)).nice();
    y.domain(d3.extent(filteredData, d => d.ElectricRange)).nice();

    // Bind data
    const circles = svg.selectAll("circle")
      .data(filteredData, d => d.Model);

    // Enter new elements
    circles.enter()
      .append("circle")
      .attr("cx", d => x(d.BaseMSRP))
      .attr("cy", d => y(d.ElectricRange))
      .attr("r", 5)
      .style("fill", d => color(d.Make))
      .style("stroke", "black")
      .merge(circles) // Merge with the update selection
      .transition()
      .duration(1000)
      .attr("cx", d => x(d.BaseMSRP))
      .attr("cy", d => y(d.ElectricRange));

    // Remove old elements
    circles.exit().remove();

    // Update axes
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    yAxis.transition().duration(1000).call(d3.axisLeft(y));
  };

  // Initialize chart with the first vehicle type
  updateChart(vehicleTypes[0]);

  // Update chart when dropdown selection changes
  d3.select("#dropdown").on("change", function () {
    const selectedType = this.value;
    updateChart(selectedType);
  });
}).catch(error => {
  console.error("Error loading data:", error);
});
