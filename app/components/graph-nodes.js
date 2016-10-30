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
    const R = 18;

    // objectify the graph
    edges.forEach((edge) => {
      nodes.forEach((node) => {
        if (node.id === edge.cons) {
          edge.target = node;
        } else if (node.id === edge.prod) {
          edge.source = node;
        }
      });
    });

    // create nodes and links
    const d3Links = svg.selectAll('.link')
      .data(edges, (d) => { return d.cons + '_' + d.prod; });

    d3Links
      .enter().append('line')
        .attr('class', 'link');

    const d3Nodes = svg.selectAll('.node')
      .data(nodes, (d) => { return d.id; });

    const enterNodes = d3Nodes.enter().append('g')
      .attr('class', 'node');

    enterNodes.append('circle')
      .attr('r', R);

    // draw the label
    enterNodes.append('text')
      .text((d) => { return d.desc; })
      .attr('dy', '0.35em');

    // cola layout
    nodes.forEach((v) => {
      v.width = 2.5 * R;
      v.height = 2.5 * R;
    });

    const simulation = cola.d3adaptor()
      .size([width, height])
      .linkDistance(50)
      .avoidOverlaps(true)
      .nodes(nodes)
      .links(edges)
      .on('tick', function () {
        d3Nodes.attr('transform', (d) => { return `translate(${d.x},${d.y})`; });

        d3Links
          .attr('x1', (d) => { return d.source.x; })
          .attr('y1', (d) => { return d.source.y; })
          .attr('x2', (d) => { return d.target.x; })
          .attr('y2', (d) => { return d.target.y; });
      });

    enterNodes.call(simulation.drag);
    simulation.start(30, 30, 30);
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
