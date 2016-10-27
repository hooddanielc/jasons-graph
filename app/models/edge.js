import DS from 'ember-data';

export default DS.Model.extend({
  cons: DS.belongsTo('node'),
  prod: DS.belongsTo('node'),
  isActive: DS.attr('boolean')
});
