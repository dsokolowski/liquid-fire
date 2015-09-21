import Ember from 'ember';

var get = Ember.get;

export default Ember.Mixin.create({

  classNames: ['liquid-each-item'],

  parent: null,

  willDestroy: function() {
    var parent = this.get('parent');
    if (!parent) { return; }
    parent.send('itemWillDestroy', this);
  },

  willRender: function() {
    var parent = this.get('parent');
    if (!parent) { return; }
    parent.send('itemWillRender', this);
  },

  didRender: function() {
    var parent = this.get('parent');
    if (!parent) { return; }
    parent.send('itemDidRender', this);
  }
});
