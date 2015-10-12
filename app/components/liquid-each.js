import Ember from 'ember'

export default Ember.Component.extend({

  classNames: ['liquid-each'],

  name: 'liquid-each',

  positionalParams: ['collection'],

  customItemWrapper: false,

  keyName: null,

  keyValue: null,

  transitionMap: Ember.inject.service('liquid-fire-transitions'),

  didRender: function(){
    this._super();
    this._canAnimate = true;
  },

  actions: {
    itemWillDestroy: function(view) {
        this._cacheChildren();
        this._unregisterChild(view);
      },

    itemWillRender: function(view) {
        this._cacheChildren();
        this._unregisterChild(view);
      },

    itemDidRender: function(view) {
        this._registerChild(view);
        if (this._canAnimate) {
          Ember.run.once(this, this._transitionCollection);
        }else{
          this._clearChildrenCache();
        }
      }
  },

  _children: Ember.computed(function() {
    return ChildrenArray.create({ content: [] });
  }),

  _childrenCache: null,

  _cacheChildren: function() {
    if (this.get('_childrenCache')) { return; }
    this.set('_childrenCache', this.get('_children').computeAndClone());
  },

  _clearChildrenCache: function() {
    this.set('_childrenCache', null);
  },

  _registerChild: function(view) {
    var children = this.get('_children');

    if (!view || !view.$()) { return; }
    if (children.findBy('view', view)) { return; }

    children.pushObject({ dom: view.$(), view: view });
  },

  _unregisterChild: function(view) {
    var children = this.get('_children');
    children.removeObject(children.findBy('view', view));
  },

  _transitionCollection: function() {
    var children = this.get('_children').compute().toArray();
    var childrenCache = this.get('_childrenCache').toArray();

    if (Ember.isEmpty(childrenCache)) { return; }

    var versions = [
        { value: children, view: this },
        { value: childrenCache, view: this }
      ];

    var transition = this.get('transitionMap')
      .transitionFor({
        versions: versions,
        parentElement: this.$(),
        use: this.get('use'),
        firstTime: 'no',
        helperName: this.get('name'),
        outletName: this.get('outletName')
      });

    if (this._runningTransition) {
      this._runningTransition.interrupt();
    }
    this._runningTransition = transition;

    transition.run();
    this._clearChildrenCache();
  }
});

var ChildrenArray = Ember.ArrayProxy.extend({
  compute: function(){
    this.get('content').forEach(function(child){
      child.offset = child.dom.offset();
      child.visible = child.dom.is(':visible');
    });
    return this;
  },

  computeAndClone: function() {
    this.compute();
    return this.get('content')
      .toArray()
      .map(function(child) {
          return {
            offset: child.offset,
            dom: child.dom.clone(),
            view: child.view,
            visible: child.visible
          };
        });
  }
})
