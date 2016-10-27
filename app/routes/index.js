import Ember from 'ember';
import json from '../fixtures/graph';

export default Ember.Route.extend({
  model: function () {
    return json;
  }
});
