const template = `
<div class="container u-mt-xl">
  <!--- App loader -->
  <div class="page-center" v-if="isAppLoading">
    <vs-loader class="u-p" center></vs-loader>
  </div>

  <!--- Group Selector -->
  <div v-else>
    <div class="form-element white-box">
      <div class="row">
        <div class="col-5">
          <vs-select
            is-search
            is-compact
            label="Select A Group"
            :options="allGroupsOptions"
            v-model="form.group"
            @change="getGroupAvailability">
          </vs-select>
        </div>
        <div class="col-4">
          <vs-button variant="light" size="small" @click="getAllGroups(true)" fill class="u-mt-28">
            <garden-icon
              icon="zd-refresh"
              name="Refresh groups"
              class="u-fg-grey-600 icon-refresh">
            </garden-icon>
          </vs-button>
        </div>
      </div>
    </div>

    <!--- Selected Group Loader -->
    <vs-loader 
      v-if="isGroupsLoading"
      center
      class="u-mt-xxl">
    </vs-loader>

    <!--- Selected Group Table -->
    <div class="white-box u-mt-xl" v-else-if="isSelectedGroupDataAvailable">
      <table class="c-table">
        <thead>
          <tr class="c-table__row c-table__row--header">
            <td class="c-table__row__cell">Group ID</td>
            <td class="c-table__row__cell">
              Online
              <span class="online">•</span>
            </td>
            <td class="c-table__row__cell">
              Offline
              <span class="offline">•</span>
            </td>
            <td class="c-table__row__cell">Total Consumed Capacity</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="c-table__row__cell">{{selectedGroup?.group_id}}</td>
            <td class="c-table__row__cell">{{selectedGroup?.channel_group_statuses?.support?.state_counts?.online}}</td>
            <td class="c-table__row__cell">{{selectedGroup?.channel_group_statuses?.support?.state_counts?.offline}}</td>
            <td class="c-table__row__cell">{{selectedGroup?.channel_group_statuses?.support?.total_consumed_capacity}}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>`;

import ZDClient from '../services/ZDClient.js';
import GardenIcon from '../components/Common/GardenIcon.js';

const { reactive, computed, onMounted, onUpdated, inject, toRefs } = Vue;
const App = {
  template,

  components: {
    GardenIcon,
  },

  setup() {
    // only required outside the template
    const $t = inject('$t');

    // data
    const data = reactive({
      isAppLoading: false,
      isGroupsLoading: false,
      isSelectedGroupDataAvailable: false,
      groups: [],
      form: {
        group: '',
      },
      selectedGroup: {},
    });

    onMounted(async () => {
      getAllGroups();
    });

    /**
     * Get all groups options and return an array of objects
     * @returns {Array}
     */
    const allGroupsOptions = computed(() => {
      if (!data.groups.groups || data.groups.groups.length === 0) return [];
      return data.groups.groups.map(group => {
        return { value: group.id, label: group.name };
      });
    });

    /**
     * Get all groups
     */
    async function getAllGroups(isRefresh = false) {
      try {
        data.isAppLoading = true;
        const SSKey = 'zd_groups';
        if (isRefresh) {
          sessionStorage.removeItem(SSKey);
        }
        if (sessionStorage.getItem(SSKey) === null) {
          const response = await ZDClient.getAllGroups();
          data.groups = response;
          sessionStorage.setItem(SSKey, JSON.stringify(response));
        } else {
          data.groups = JSON.parse(sessionStorage.getItem(SSKey));
        }
      } catch (error) {
        console.error('getAllGroups', error);
      } finally {
        data.isAppLoading = false;
      }
    }

    /**
     * Get group availability
     */
    async function getGroupAvailability() {
      try {
        data.isGroupsLoading = true;
        const response = await ZDClient.getGroupAvailability(data.form.group);
        data.selectedGroup = response;
        data.isSelectedGroupDataAvailable = true;
      } catch (error) {
        console.error('getGroupAvailability', error);
        data.isSelectedGroupDataAvailable = false;
      } finally {
        data.isGroupsLoading = false;
      }
    }

    // returning here functions and variables used by your template
    return { ...toRefs(data), allGroupsOptions, getAllGroups, getGroupAvailability };
  },
};

export default App;
