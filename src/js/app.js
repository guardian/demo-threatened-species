import * as d3 from 'd3'

var features,svg,simulation;
var pageWidth = document.documentElement.clientWidth;
var pageHeight = document.documentElement.clientHeight;
var width,height,headerHeight;
var startYear = 2000;
var oldData;
var path = process.env.PATH;
var mobile = false;
if (pageWidth < 640) {
	mobile = true;
}

console.log(process.env.PATH)
width = document.querySelector(".interactive").getBoundingClientRect().width;
var color = d3.scaleOrdinal(d3.schemeCategory10);
// headerHeight = document.querySelector(".header").getBoundingClientRect().height;

// if (width > 1260) {
// 	width = 1260; 
// }
height = width * 0.60
if (mobile) {
	height = width * 1.5
}
var margin = {top: 0, right: 0, bottom: 0, left:0};
var scaleFactor = width/1300;

console.log()

svg = d3.select("#graphic").append("svg")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");

features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv(path + '/assets/data.csv', function(data) {
	
	data.forEach(function(d) {
		d.year = +d.year;
	})
	makeChart(data);

})

function makeChart(data) {

	console.log(data);

	var filteredData = data.filter(function(d){return d.year == startYear;});
	
	console.log(filteredData)

	var center = {x: width / 2, y: height / 2};
	var forceStrength = 0.03;

	simulation = d3.forceSimulation(filteredData)
		.force('x', d3.forceX().x(center.x))
		.force('y', d3.forceY().y(center.y))
		.force("collide",d3.forceCollide(6).iterations(16) )
		.force('charge', d3.forceManyBody().strength(-4))
	    .alphaTarget(1)
	    .on("tick", ticked);

	function ticked() {

		features.selectAll(".nodes").attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" });

		// node.attr("cx", function(d) { return d.x; })
  //     .attr("cy", function(d) { return d.y; })
	}

	oldData = filteredData;
	simulation.nodes(filteredData);   

	function updateChart(year) {

		console.log("update")


		var keyedOldData = {}

		oldData.forEach( function(d) {
			keyedOldData[d.name.replace(" ","_")] = d
		})

		console.log("old data",keyedOldData)

		var newData = data.filter(function(d){ return d.year == year; });

		console.log("new data",newData)
		newData.forEach(function (node) {
			if (year == 1994) {
				node.x = 0
		       	node.y = 0
			}
			else {
				if (node.name.replace(" ","_") in keyedOldData) {
			       	node.x = keyedOldData[node.name.replace(" ","_")].x
			       	node.y = keyedOldData[node.name.replace(" ","_")].y
	    		}

	    		else {
	    			node.x = 0
		       		node.y = 0
	    		}
			}
	    	


	  })

		var node = features.selectAll(".nodes").data(newData, function (d) {return d.name.replace(" ", "_")})
		// node.data(filteredData, function (d) {return d.name.replace(" ", "_")}).merge(node);
		
		node.exit().remove();

		var nodeContainer = node.enter()
			.append("g")
			.attr("class", function(d) { return "nodes"; })

		nodeContainer
				.append("circle")
				.attr("class","nodeCircle")
				.attr("title", function(d) { return d.code + " " + d.name + " " + d.year})		
				.attr("fill", function(d) { return color(d.kingdom); })	
				.attr("r", 5)

		d3.selectAll(".nodeCircle").attr("fill", function(d) { return color(d.kingdom); })

		forceStrength = 0.03;
		simulation.nodes(newData);
	    simulation.force('x', d3.forceX().x(nodePos))
	    simulation.force('x', d3.forceX().x(nodePos))
	    simulation.alpha(1).restart();
	    oldData = newData;

	 	function nodePos(d) {
	 		if (d.code === "VU") {
	 			return (width * 0.2)
	 		}

	 		else if (d.code == "EN") {
	 			return (2* (width * 0.2))
	 		}

	 		else if (d.code == "CR") {
	 			return (3* (width * 0.2))
	 		}

	 		else if (d.code == "EX") {
	 			return (4 * (width * 0.2))
	 		}

	 		else {
	 			return - 100
	 		}
	 	}



	}
	var yearText = d3.select("#yearText");
	var timer = 0
	var totalYears = 34
	d3.interval(function() {
		
		var newYear = 1983 + timer;

		updateChart(newYear);
		yearText.text(newYear);

		timer++;

		if (timer == totalYears) {
			timer = 0
		}
	}, 1000)
}



// var data = d3.csvParse(speciesData);