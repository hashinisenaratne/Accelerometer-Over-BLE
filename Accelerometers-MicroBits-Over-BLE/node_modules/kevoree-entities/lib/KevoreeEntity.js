var Class       = require('pseudoclass'),
    Dictionary  = require('./Dictionary');

/**
 * Abstract class: KevoreeEntity
 * <br/>
 * You are not supposed to instantiate this class manually. It makes no sense
 * <br/>
 * You should create your own Kevoree entity that extend one of the defined abstraction type:
 * <ul>
 *     <li>AbstractNode</li>
 *     <li>AbstractGroup</li>
 *     <li>AbstractChannel</li>
 *     <li>AbstractComponent</li>
 * </ul>
 * All this sub-classes extend KevoreeEntity in order to have the same basic prototype
 *
 * @class
 */
var KevoreeEntity = Class({
    toString: 'KevoreeEntity',

    /**
     * @constructs
     */
    construct: function () {
        this.kCore = null;
        this.dictionary = new Dictionary(this);
        this.name = null;
        this.path = null;
        this.nodeName = null;
        this.started = false;
    },

    /**
     * Called when an entity has to start
     * @param done
     */
    start: function (done) {
        done();
    },

    /**
     * Called when an entity has to stop
     * @param done
     */
    stop: function (done) {
        done();
    },

    /**
     * Called when a attribute has been changed (this method is called after all attribute-specific update() method)
     * @param done
     */
    update: function (done) {
        done();
    },

    __start__: function (done) {
        this.log = this.kCore.getLogger();
        this.started = true;
        this.start(done);
    },

    __stop__: function (done) {
        this.started = false;
        this.stop(done);
    },

    __update__: function (done) {
        this.update(done);
    },

    setKevoreeCore: function (kCore) {
        this.kCore = kCore;
    },

    /**
     *
     * @returns {Object}
     */
    getKevoreeCore: function () {
        return this.kCore;
    },

    getDictionary: function () {
        return this.dictionary;
    },

    getName: function () {
        return this.name;
    },

    getNodeName: function () {
        return this.nodeName;
    },

    setName: function (name) {
        this.name = name;
    },

    setPath: function (path) {
        this.path = path;
    },

    getPath: function () {
        return this.path;
    },

    setNodeName: function (name) {
        this.nodeName = name;
    },

    /**
     * Tries to retrieve this Kevoree entity from deployModel first.
     * If deployModel is null (meaning that we are in a deployed-state and not in a deploying-state)
     * it tries to retrieve this Kevoree entity from currentModel.
     * @returns {*}
     */
    getModelEntity: function () {
        var model = this.kCore.getDeployModel();
        if (!model) {
            model = this.kCore.getCurrentModel();
        }
        return model.findByPath(this.path);
    },

    getNetworkInfos: function (nodeName) {
        var model = this.kCore.getDeployModel();
        if (!model) {
            this.kCore.getCurrentModel();
        }
        var node = model.findNodesByID(nodeName);
        if (node) {
            return node.networkInformation.iterator();
        } else {
            return null;
        }
    },

    isStarted: function () {
        return this.started;
    },

    /**
     * Executes script with current model context. If callback parameter is set,
     * it means something went wrong and the parameter is the error object.
     * NB: scripts submitted while in "deploying" state are queued and executed after.
     * @param script KevScript string
     * @param [callback] function (err)
     */
    submitScript: function (script, callback) {
        this.getKevoreeCore().submitScript(script, callback);
    }
});

KevoreeEntity.DIC = 'dic_';
module.exports = KevoreeEntity;
