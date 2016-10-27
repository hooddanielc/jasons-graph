import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  classNames: ['graph-nodes'],
  data: null,
  width: 1280,
  height: 800,
  store: Ember.inject.service('store'),

  fixWidth: function () {
    this.$('svg').width(this.get('width'));
  }.observes('width'),

  fixHeight: function () {
    this.$('svg').height(this.get('height'));
  }.observes('height'),

  initGraph: function () {
    this.$().append(Ember.$(`<svg width="${this.get('width')}" height="${this.get('height')}"/>`));
    const svg = d3.select(this.$('svg')[0]);
    const width = this.get('width');
    const height = this.get('height');
    const edges = this.get('data.edges');
    const nodes = this.get('data.nodes');

    edges.forEach((edge) => {
      nodes.forEach((node) => {
        if (node.id === edge.cons) {
          edge.target = node;
        } else if (node.id === edge.prod) {
          edge.source = node;
        }
      });
    });

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function (d) { return d.id; }))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
        .attr('stroke-width', function () { return 4; });

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
        .attr('r', 5)
        .call(d3.drag()
          .on('start', (d) => { return this.dragStarted(d); })
          .on('drag', (d) => { return this.dragged(d); })
          .on('end', (d) => { return this.dragEnded(d); }));

    node.append('title').text(function (d) { return d.id; });

    simulation.nodes(nodes).on('tick', () => {
      link
        .attr("x1", (d) => { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    });

    this.set('simulation', simulation);
  }.on('didInsertElement'),

  dragStarted: function (d) {
    if (!d3.event.active) {
      this.get('simulation').alphaTarget(0.3).restart();
    }

    d.fx = d.x;
    d.fy = d.y;
  },

  dragged: function (d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },

  dragEnded: function (d) {
    if (!d3.event.active) {
      this.get('simulation').alphaTarget(0);
    }

    d.fx = null;
    d.fy = null;
  },

  normalizeData: function () {
    const data = this.get('data');

    const nodes = DS.RecordArray.create({
      content: Ember.A(),
      objectAtContent: function(idx) {
        return this.get('content').objectAt(idx);
      }
    });

    const edges = DS.RecordArray.create({
      content: Ember.A(),
      objectAtContent: function(idx) {
        return this.get('content').objectAt(idx);
      }
    });

    if (!data) {
      throw 'graph-nodes expects `data` to be an object';
    }

    data.nodes.forEach((node) => {
      const record = this.get('store').createRecord('node', node);
      nodes.pushObject(record);
    });

    data.edges.forEach((edge) => {
      const record = this.get('store').createRecord('edge', edge);
      record.set('cons', this.get('store').peekRecord('node', edge.cons));
      record.set('prod', this.get('store').peekRecord('node', edge.prod));
      edges.pushObject(record);
    });

    this.setProperties({
      nodes: nodes,
      edges: edges
    });
  }.on('init')
});
