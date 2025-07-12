const express = require('express');
const fs = require('fs-extra');

const app = express();

const port = 3000;


// Nodes and edges 
const data = {
  nodes: [
    { id: "Blantyre", x: 0.9134213014976535, y: 0.2540740323898225 },
    { id: "Chikwawa", x: 0.14374226893980302, y: 0.3910154112946962 },
    { id: "Chiradzulu", x: 0.9351749046225152, y: 0.5027042682331085 },
    { id: "Chitipa", x: 0.5033532302137712, y: 0.6371050642113303 },
    { id: "Dedza", x: 0.32675593364689126, y: 0.32741458873737384 },
    { id: "Dowa", x: 0.44893854232683894, y: 0.3534310438093927 },
    { id: "Karonga", x: 0.7719114930591756, y: 0.7164846847486838 },
    { id: "Kasungu", x: 0.9486271739760203, y: 0.03717616769235954 },
    { id: "Lilongwe", x: 0.03185092819745572, y: 0.07907784991666855 },
    { id: "Machinga", x: 0.4976553188158377, y: 0.15957191749775634 },
    { id: "Mangochi", x: 0.2417748469656349, y: 0.22132470346325728 },
    { id: "Mchinji", x: 0.8029651384628501, y: 0.4170419722297135 },
    { id: "Mulanje", x: 0.6998851394303303, y: 0.7300336822154281 },
    { id: "Mwanza", x: 0.3093976112949879, y: 0.9141857772478698 },
    { id: "Mzimba", x: 0.16190201617155997, y: 0.8356366262711726 },
    { id: "Neno", x: 0.9869012833729535, y: 0.3511167097222222 },
    { id: "Nkhata Bay", x: 0.0882233026546202, y: 0.18674223158715342 },
    { id: "Nkhotakota", x: 0.17467106409589772, y: 0.0010883823237957113 },
    { id: "Nsanje", x: 0.8093914854184416, y: 0.5079865816371467 },
    { id: "Ntcheu", x: 0.8588177668360885, y: 0.4167540312634731 },
    { id: "Ntchisi", x: 0.3969781197576786, y: 0.9982702660465445 },
    { id: "Phalombe", x: 0.934352810085411, y: 0.7328019939159007 },
    { id: "Rumphi", x: 0.2438492080065875, y: 0.0387865957339274 },
    { id: "Salima", x: 0.837201462046805, y: 0.9965726289086905 },
    { id: "Thyolo", x: 0.6272655175304893, y: 0.7688215502317457 },
    { id: "Zomba", x: 0.7252659639019722, y: 0.810888016094619 },
    { id: "Balaka", x: 0.15932838570160823, y: 0.5698123530031478 },
    { id: "Likoma", x: 0.3488343806746971, y: 0.6253864059894712 }
  ],
  edges: [
    ["Blantyre", "Chikwawa"], ["Blantyre", "Chiradzulu"], ["Blantyre", "Thyolo"],
    ["Chikwawa", "Nsanje"], ["Chikwawa", "Mwanza"], ["Chiradzulu", "Zomba"],
    ["Chiradzulu", "Phalombe"], ["Chitipa", "Karonga"], ["Dedza", "Lilongwe"],
    ["Dedza", "Ntcheu"], ["Dowa", "Lilongwe"], ["Dowa", "Ntchisi"],
    ["Karonga", "Rumphi"], ["Kasungu", "Lilongwe"], ["Kasungu", "Mzimba"],
    ["Lilongwe", "Mchinji"], ["Lilongwe", "Salima"], ["Machinga", "Zomba"],
    ["Machinga", "Balaka"], ["Mangochi", "Balaka"], ["Mangochi", "Salima"],
    ["Mulanje", "Phalombe"], ["Mulanje", "Thyolo"], ["Mwanza", "Neno"],
    ["Mzimba", "Nkhata Bay"], ["Mzimba", "Rumphi"], ["Nkhata Bay", "Nkhotakota"],
    ["Nkhotakota", "Salima"], ["Nsanje", "Chikwawa"], ["Ntcheu", "Balaka"],
    ["Ntchisi", "Nkhotakota"], ["Phalombe", "Mulanje"], ["Salima", "Nkhotakota"],
    ["Zomba", "Machinga"]
  ]
};

// Getting a node by Id 
const nodeById = {};
data.nodes.forEach(n => nodeById[n.id] = n);

// Simple force-directed layout parameters
const ITERATIONS = 500;
const AREA = 1;
const K = Math.sqrt(AREA / data.nodes.length); // Ideal edge length
const repulsion = 0.01;
const attraction = 0.1;

for (let iter = 0; iter < ITERATIONS; iter++) {
  // Initialize force vectors
  const forces = {};
  data.nodes.forEach(n => {
    forces[n.id] = { x: 0, y: 0 };
  });

  // Repulsion between every pair of nodes
  for (let i = 0; i < data.nodes.length; i++) {
    for (let j = i + 1; j < data.nodes.length; j++) {
      const nodeA = data.nodes[i];
      const nodeB = data.nodes[j];
      const dx = nodeA.x - nodeB.x;
      const dy = nodeA.y - nodeB.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

      const force = repulsion / dist;
      forces[nodeA.id].x += (dx / dist) * force;
      forces[nodeA.id].y += (dy / dist) * force;
      forces[nodeB.id].x -= (dx / dist) * force;
      forces[nodeB.id].y -= (dy / dist) * force;
    }
  }

  // Attraction along edges
  data.edges.forEach(([a, b]) => {
    const nodeA = nodeById[a];
    const nodeB = nodeById[b];
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;

    const force = attraction * (dist - K);
    forces[a].x -= (dx / dist) * force;
    forces[a].y -= (dy / dist) * force;
    forces[b].x += (dx / dist) * force;
    forces[b].y += (dy / dist) * force;
  });

  // Update positions
  data.nodes.forEach(n => {
    n.x += forces[n.id].x;
    n.y += forces[n.id].y;

    // Clamp to 0-1
    n.x = Math.max(0, Math.min(1, n.x));
    n.y = Math.max(0, Math.min(1, n.y));
  });
}

// Output new positions
// Save optimized coordinates to JSON
console.log("Optimized Node Positions:");
data.nodes.forEach(n => {
  console.log(`${n.id}: (${n.x.toFixed(4)}, ${n.y.toFixed(4)})`);
//   fs.writeFileSync("optimized_nodes.json", JSON.stringify(data.nodes, null, 2));
});

// Save as HTML file
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Malawi District Graph Layout</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
    <div style="padding: 50px;text-align: center;">
        <svg width="800" height="800"></svg>
        <script>
        const width = 600, height = 600;
        const nodes = ${JSON.stringify(data.nodes)};
        const links = ${JSON.stringify(data.edges.map(([a, b]) => ({ source: a, target: b })))};

        const svg = d3.select("svg");
        const nodeById = {};
        nodes.forEach(d => nodeById[d.id] = d);

        svg.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("x1", d => nodeById[d.source].x * width)
        .attr("y1", d => nodeById[d.source].y * height)
        .attr("x2", d => nodeById[d.target].x * width)
        .attr("y2", d => nodeById[d.target].y * height)
        .attr("stroke", "#999")
        .attr("stroke-width", 1);

        svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x * width)
        .attr("cy", d => d.y * height)
        .attr("r", 5)
        .attr("fill", "steelblue");

        svg.selectAll("text")
        .attr("transform", "rotate(45)")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", d => d.x * width + 6)
        .attr("y", d => d.y * height + 4)
        .text(d => d.id)
        .attr("font-size", "10px");
        </script>
    </div>
</body>
</html>
`;

fs.writeFileSync("malawi_district_graph.html", htmlContent);
console.log("HTML visualization saved to malawi_district_graph.html");


const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server is running from ${PORT}`);
})