/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import fixtureData from '../../fixtures/graph';

describeComponent(
  'graph-nodes',
  'Integration: GraphNodesComponent',
  {
    integration: true
  },
  function() {
    beforeEach(function () {
      this.set('data', fixtureData);
    });

    it('throws if data is not defined', function () {
      expect(() => {
        this.render(hbs`{{graph-nodes}}`);
      }).to.throw('graph-nodes expects `data` to be an object');
    });

    it('renders', function () {
      this.timeout(100000);
      this.render(hbs`{{graph-nodes data=data}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
