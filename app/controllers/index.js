import Ember from 'ember';

export default Ember.Controller.extend({
  windowWidth: 800,
  windowHeight: 600,

  setWidthHeight: function () {
    this.setProperties({
      windowWidth: Ember.$('body').innerWidth(),
      windowHeight: Ember.$('body').innerHeight()
    });

    Ember.$(window).on('resize', () => {
      this.setWidthHeight();
    });
  }.on('init')
});
