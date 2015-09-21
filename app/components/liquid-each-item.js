import Ember from 'ember';
import LiquidEachItemMixin from '../mixins/liquid-each-item';

var get = Ember.get;

export default Ember.Component.extend(LiquidEachItemMixin, {

  item: null,

  keyName: null,

  keyValue: null,

  didRender: function() {
    this._setKeyAttribute();
  },

  _setKeyAttribute: function() {
    var keyValue = this.get('keyValue');

    if (!keyValue || !this.$()) { return; }

    var obj = this.get('item');
    var keyName = this.get('keyName') || this.get('keyValue').dasherize();
    this.$().attr(keyName, get(obj, keyValue));
  }
});
