var knowledgeGraphSVG;

var updateGraph;

var initialGraph = function(){
    knowledgeGraphSVG = d3.select("#knowledgeGraph"),
        width = +knowledgeGraphSVG.attr("width"),
        height = +knowledgeGraphSVG.attr("height");

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    var tooltip = d3.select("body")
        .append("div")
        .attr('class', 'tooltipm')
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");

    updateGraph = function() {
        graphLinkData = [];
        graphNodeData = {};

        for (var entity1 in filteredEntities['selected']) {
            for (var entity2 in filteredEntities['selected'][entity1]['selected']) {
                if (!(entity2 in filteredEntities['selected']) || filteredEntities['selected'][entity1]['selected'][entity2] == 'r') {
                    graphLinkData.push(
                        filteredEntities['selected'][entity1]['selected'][entity2] == 'r' ? {
                            "source": entity1,
                            "target": entity2,
                            "value": 1
                        } : {
                            "source": entity2,
                            "target": entity1,
                            "value": 1
                        }
                    );
                    graphNodeData[entity1] = {'id': entity1, 'group': 1};
                    graphNodeData[entity2] = {'id': entity2, 'group': 1};
                }
            }
        }
        graphNodeData = Object.values(graphNodeData);
        console.log(graphLinkData);
        console.log(graphNodeData);

        knowledgeGraphSVG.selectAll('g').remove();
        var link = knowledgeGraphSVG.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graphLinkData)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value);
            })
            .on('mouseover', function (d) {
                tooltip
                    .html(function () {
                        var relation = extracted_data[d["source"]['id'] + ' ' + d['target']['id']];
                        var relationName = relation_data[relation['p']];
                        var displayinfo = "<span style='color:#d9e778'>" + "<strong>" + relationName + "</strong><br>";
                        displayinfo += "<strong>" + d["source"]['id'] + "</strong><br>";
                        displayinfo += "<strong>" + d["target"]['id'] + "</strong>";
                        displayinfo += "</span>";
                        return displayinfo;
                    })
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("visibility", "visible");
            })
            .on('mouseout', function () {
                if (!(tooltip.style("visibility") === "visible")) {
                    return;
                }
                tooltip.style("visibility", "hidden");
            })
            .on('click', function(d){
                updateAttentionView([d["source"]['id'],d["target"]['id']]);
            });

        var node = knowledgeGraphSVG.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graphNodeData)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function (d) {
                return color(d.group);
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on('mouseover', function (d) {
                tooltip
                    .html(function () {
                        var entityName = d['id'];
                        var displayinfo = "<span style='color:#13008b'><strong>" + entityName + "</strong></span>";
                        return displayinfo;
                    })
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("visibility", "visible");
            })
            .on('mouseout', function () {
                if (!(tooltip.style("visibility") === "visible")) {
                    return;
                }
                tooltip.style("visibility", "hidden");
            });

        node.append("title")
            .text(function (d) {
                return d.id;
            });

        simulation
            .nodes(graphNodeData)
            .on("tick", ticked);

        simulation.force("link")
            .links(graphLinkData);

        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
}