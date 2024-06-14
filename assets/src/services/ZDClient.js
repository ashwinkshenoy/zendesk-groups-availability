let CLIENT = {};
let APP_SETTINGS = {};

const ZDClient = {
  events: {
    ON_APP_REGISTERED(cb) {
      return CLIENT.on('app.registered', async data => {
        APP_SETTINGS = data.metadata.settings;
        return cb(data);
      });
    },
  },

  init() {
    CLIENT = ZAFClient.init();
  },

  /**
   * Set getters for private objects
   */
  app: {
    get settings() {
      return APP_SETTINGS;
    },

    /**
     * It returns true if the app is installed in the instance, false if
     * it's running locally
     */
    get isProduction() {
      return !!this.settings.IS_PRODUCTION;
    },
  },

  /**
   * It sets the frame height using on the passed value.
   * If no value has been passed, 80 will be set as default heigth.
   * @param {Int} newHeight
   */
  resizeFrame(appHeight) {
    CLIENT.invoke('resize', { width: '100%', height: `${appHeight}px` });
  },

  /**
   * Calls ZAF Client.request()
   * @returns {Promise}
   */
  async request(url, data, options = {}) {
    return await CLIENT.request({
      url,
      data,
      secure: APP_SETTINGS.IS_PRODUCTION,
      contentType: 'application/json',
      ...options,
    });
  },

  /**
   * Calls ZAF Client.get()
   * @param {String} getter
   */
  async get(getter) {
    return (await CLIENT.get(getter))[getter];
  },

  /**
   * Performs ZAFClient.set()
   * @param {Object} param
   */
  async set(param) {
    return await CLIENT.set(param);
  },

  /**
   * Notify user that something happened
   * Usually after taking some action
   * @param {string} message
   * @param {string} type
   * @param {number} durationInMs
   */
  notify(message, type = 'success', durationInMs = 5000) {
    CLIENT.invoke('notify', message, type, durationInMs);
  },

  /**
   * Get all groups
   * @returns {Object}
   */
  getAllGroups() {
    return this.request(`/api/v2/groups.json?per_page=1000`, null, {
      method: 'GET',
    });
  },

  /**
   * Get groups availability
   * @param {Number} groupId
   * @returns {Object}
   */
  getGroupAvailability(groupId) {
    return this.request(
      `/api/v2/account_groups/availability/${groupId}`,
      {},
      {
        method: 'GET',
      },
    );
  },
};

export default ZDClient;
