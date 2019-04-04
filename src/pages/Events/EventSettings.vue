<template>
  <card>
    <h5 slot="header" class="title">Edit Settings</h5>
    <form @submit.prevent="updateSettings">
      <div class="row">
        <div class="col-md-2">
          <p class="category mt-2">Weekly Emails</p>
          <base-switch
            v-model="settings.should_weekly_email"
            type="primary"
            on-text="ON"
            off-text="OFF"
          ></base-switch>

          <p class="category mt-2">Daily Emails</p>
          <base-switch
            v-model="settings.should_daily_email"
            type="primary"
            on-text="ON"
            off-text="OFF"
          ></base-switch>

          <p class="category mt-2">Timezone</p>
          <el-select
            class="select-primary"
            size="large"
            placeholder="Choose a timezone"
            v-model="settings.user_timezone"
          >
            <el-option
              v-for="option in timezones"
              class="select-primary"
              :value="option.value"
              :label="option.label"
              :key="option.label"
            ></el-option>
          </el-select>
          <p class="category mt-2">Find Timezone</p>
          <base-button
            @click.native="findCurrentTimeZone">
            Use Local Time
          </base-button>
        </div>

        <div class="col-md-5">
          <h5 slot="header" class="title">Edit Event Subscriptions</h5>
          <p>Configure which notifications you would like to be alerted about:</p>
          <base-table :data="userSubscriptions" thead-classes="text-primary">
            <template slot-scope="{ row, $index }">
              <td>
                <!-- "  -->
                <base-checkbox
                  :checked="row.subscribed"
                  :disabled="row.disabled"
                  v-on:input="subscribe(row, $event)"
                  :key="row.type_id"
                ></base-checkbox>
              </td>
              <td>
                <el-tooltip
                  v-if="row.disabled"
                  content="This option is not currently implemented"
                  effect="light"
                  :open-delay="150"
                  placement="top"
                >
                  <p class="text-muted">Disabled</p>
                </el-tooltip>
                <p class="title">{{ row.title }}</p>
                <div class="notification-text">{{ row.description }}</div>
              </td>
            </template>
          </base-table>
        </div>
      </div>

      <base-button native-type="submit" type="primary" :disabled="isUpdating || isLoading" class="btn-fill">Save</base-button>
    </form>
  </card>
</template>
<script>
import { Select, Option } from 'element-ui';
import { BaseTable, BaseSwitch } from 'src/components/index';
import { mapGetters } from 'vuex';

export default {
  components: {
    [Option.name]: Option,
    [Select.name]: Select,
    BaseSwitch,
    BaseTable
  },
  computed: {
    ...mapGetters('event', [
      'shouldDailyEmail',
      'shouldWeeklyEmail',
      'eventByTypeID',
      'userTimezone',
      'userSubscriptions',
      'isLoading',
      'isUpdating'
    ])
  },
  data() {
    return {
      timezones: [
        { value: 'Africa/Abidjan', label: 'Africa/Abidjan' },
        { value: 'Africa/Accra', label: 'Africa/Accra' },
        { value: 'Africa/Addis_Ababa', label: 'Africa/Addis Ababa' },
        { value: 'Africa/Algiers', label: 'Africa/Algiers' },
        { value: 'Africa/Asmara', label: 'Africa/Asmara' },
        { value: 'Africa/Bamako', label: 'Africa/Bamako' },
        { value: 'Africa/Bangui', label: 'Africa/Bangui' },
        { value: 'Africa/Banjul', label: 'Africa/Banjul' },
        { value: 'Africa/Bissau', label: 'Africa/Bissau' },
        { value: 'Africa/Blantyre', label: 'Africa/Blantyre' },
        { value: 'Africa/Brazzaville', label: 'Africa/Brazzaville' },
        { value: 'Africa/Bujumbura', label: 'Africa/Bujumbura' },
        { value: 'Africa/Cairo', label: 'Africa/Cairo' },
        { value: 'Africa/Casablanca', label: 'Africa/Casablanca' },
        { value: 'Africa/Ceuta', label: 'Africa/Ceuta' },
        { value: 'Africa/Conakry', label: 'Africa/Conakry' },
        { value: 'Africa/Dakar', label: 'Africa/Dakar' },
        { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar es Salaam' },
        { value: 'Africa/Djibouti', label: 'Africa/Djibouti' },
        { value: 'Africa/Douala', label: 'Africa/Douala' },
        { value: 'Africa/El_Aaiun', label: 'Africa/El Aaiun' },
        { value: 'Africa/Freetown', label: 'Africa/Freetown' },
        { value: 'Africa/Gaborone', label: 'Africa/Gaborone' },
        { value: 'Africa/Harare', label: 'Africa/Harare' },
        { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg' },
        { value: 'Africa/Kampala', label: 'Africa/Kampala' },
        { value: 'Africa/Khartoum', label: 'Africa/Khartoum' },
        { value: 'Africa/Kigali', label: 'Africa/Kigali' },
        { value: 'Africa/Kinshasa', label: 'Africa/Kinshasa' },
        { value: 'Africa/Lagos', label: 'Africa/Lagos' },
        { value: 'Africa/Libreville', label: 'Africa/Libreville' },
        { value: 'Africa/Lome', label: 'Africa/Lome' },
        { value: 'Africa/Luanda', label: 'Africa/Luanda' },
        { value: 'Africa/Lubumbashi', label: 'Africa/Lubumbashi' },
        { value: 'Africa/Lusaka', label: 'Africa/Lusaka' },
        { value: 'Africa/Malabo', label: 'Africa/Malabo' },
        { value: 'Africa/Maputo', label: 'Africa/Maputo' },
        { value: 'Africa/Maseru', label: 'Africa/Maseru' },
        { value: 'Africa/Mbabane', label: 'Africa/Mbabane' },
        { value: 'Africa/Mogadishu', label: 'Africa/Mogadishu' },
        { value: 'Africa/Monrovia', label: 'Africa/Monrovia' },
        { value: 'Africa/Nairobi', label: 'Africa/Nairobi' },
        { value: 'Africa/Ndjamena', label: 'Africa/Ndjamena' },
        { value: 'Africa/Niamey', label: 'Africa/Niamey' },
        { value: 'Africa/Nouakchott', label: 'Africa/Nouakchott' },
        { value: 'Africa/Ouagadougou', label: 'Africa/Ouagadougou' },
        { value: 'Africa/Porto-Novo', label: 'Africa/Porto-Novo' },
        { value: 'Africa/Sao_Tome', label: 'Africa/Sao Tome' },
        { value: 'Africa/Tripoli', label: 'Africa/Tripoli' },
        { value: 'Africa/Tunis', label: 'Africa/Tunis' },
        { value: 'Africa/Windhoek', label: 'Africa/Windhoek' },
        { value: 'America/Adak', label: 'America/Adak' },
        { value: 'America/Anchorage', label: 'America/Anchorage' },
        { value: 'America/Anguilla', label: 'America/Anguilla' },
        { value: 'America/Antigua', label: 'America/Antigua' },
        { value: 'America/Araguaina', label: 'America/Araguaina' },
        {
          value: 'America/Argentina/Buenos_Aires',
          label: 'America/Argentina/Buenos Aires'
        },
        {
          value: 'America/Argentina/Catamarca',
          label: 'America/Argentina/Catamarca'
        },
        {
          value: 'America/Argentina/Cordoba',
          label: 'America/Argentina/Cordoba'
        },
        { value: 'America/Argentina/Jujuy', label: 'America/Argentina/Jujuy' },
        {
          value: 'America/Argentina/La_Rioja',
          label: 'America/Argentina/La Rioja'
        },
        {
          value: 'America/Argentina/Mendoza',
          label: 'America/Argentina/Mendoza'
        },
        {
          value: 'America/Argentina/Rio_Gallegos',
          label: 'America/Argentina/Rio Gallegos'
        },
        { value: 'America/Argentina/Salta', label: 'America/Argentina/Salta' },
        {
          value: 'America/Argentina/San_Juan',
          label: 'America/Argentina/San Juan'
        },
        {
          value: 'America/Argentina/San_Luis',
          label: 'America/Argentina/San Luis'
        },
        {
          value: 'America/Argentina/Tucuman',
          label: 'America/Argentina/Tucuman'
        },
        {
          value: 'America/Argentina/Ushuaia',
          label: 'America/Argentina/Ushuaia'
        },
        { value: 'America/Aruba', label: 'America/Aruba' },
        { value: 'America/Asuncion', label: 'America/Asuncion' },
        { value: 'America/Atikokan', label: 'America/Atikokan' },
        { value: 'America/Bahia_Banderas', label: 'America/Bahia Banderas' },
        { value: 'America/Bahia', label: 'America/Bahia' },
        { value: 'America/Barbados', label: 'America/Barbados' },
        { value: 'America/Belem', label: 'America/Belem' },
        { value: 'America/Belize', label: 'America/Belize' },
        { value: 'America/Blanc-Sablon', label: 'America/Blanc-Sablon' },
        { value: 'America/Boa_Vista', label: 'America/Boa Vista' },
        { value: 'America/Bogota', label: 'America/Bogota' },
        { value: 'America/Boise', label: 'America/Boise' },
        { value: 'America/Cambridge_Bay', label: 'America/Cambridge Bay' },
        { value: 'America/Campo_Grande', label: 'America/Campo Grande' },
        { value: 'America/Cancun', label: 'America/Cancun' },
        { value: 'America/Caracas', label: 'America/Caracas' },
        { value: 'America/Cayenne', label: 'America/Cayenne' },
        { value: 'America/Cayman', label: 'America/Cayman' },
        { value: 'America/Chicago', label: 'America/Chicago' },
        { value: 'America/Chihuahua', label: 'America/Chihuahua' },
        { value: 'America/Costa_Rica', label: 'America/Costa Rica' },
        { value: 'America/Cuiaba', label: 'America/Cuiaba' },
        { value: 'America/Curacao', label: 'America/Curacao' },
        { value: 'America/Danmarkshavn', label: 'America/Danmarkshavn' },
        { value: 'America/Dawson_Creek', label: 'America/Dawson Creek' },
        { value: 'America/Dawson', label: 'America/Dawson' },
        { value: 'America/Denver', label: 'America/Denver' },
        { value: 'America/Detroit', label: 'America/Detroit' },
        { value: 'America/Dominica', label: 'America/Dominica' },
        { value: 'America/Edmonton', label: 'America/Edmonton' },
        { value: 'America/Eirunepe', label: 'America/Eirunepe' },
        { value: 'America/El_Salvador', label: 'America/El Salvador' },
        { value: 'America/Fortaleza', label: 'America/Fortaleza' },
        { value: 'America/Glace_Bay', label: 'America/Glace Bay' },
        { value: 'America/Godthab', label: 'America/Godthab' },
        { value: 'America/Goose_Bay', label: 'America/Goose Bay' },
        { value: 'America/Grand_Turk', label: 'America/Grand Turk' },
        { value: 'America/Grenada', label: 'America/Grenada' },
        { value: 'America/Guadeloupe', label: 'America/Guadeloupe' },
        { value: 'America/Guatemala', label: 'America/Guatemala' },
        { value: 'America/Guayaquil', label: 'America/Guayaquil' },
        { value: 'America/Guyana', label: 'America/Guyana' },
        { value: 'America/Halifax', label: 'America/Halifax' },
        { value: 'America/Havana', label: 'America/Havana' },
        { value: 'America/Hermosillo', label: 'America/Hermosillo' },
        {
          value: 'America/Indiana/Indianapolis',
          label: 'America/Indiana/Indianapolis'
        },
        { value: 'America/Indiana/Knox', label: 'America/Indiana/Knox' },
        { value: 'America/Indiana/Marengo', label: 'America/Indiana/Marengo' },
        {
          value: 'America/Indiana/Petersburg',
          label: 'America/Indiana/Petersburg'
        },
        {
          value: 'America/Indiana/Tell_City',
          label: 'America/Indiana/Tell City'
        },
        { value: 'America/Indiana/Vevay', label: 'America/Indiana/Vevay' },
        {
          value: 'America/Indiana/Vincennes',
          label: 'America/Indiana/Vincennes'
        },
        { value: 'America/Indiana/Winamac', label: 'America/Indiana/Winamac' },
        { value: 'America/Inuvik', label: 'America/Inuvik' },
        { value: 'America/Iqaluit', label: 'America/Iqaluit' },
        { value: 'America/Jamaica', label: 'America/Jamaica' },
        { value: 'America/Juneau', label: 'America/Juneau' },
        {
          value: 'America/Kentucky/Louisville',
          label: 'America/Kentucky/Louisville'
        },
        {
          value: 'America/Kentucky/Monticello',
          label: 'America/Kentucky/Monticello'
        },
        { value: 'America/La_Paz', label: 'America/La Paz' },
        { value: 'America/Lima', label: 'America/Lima' },
        { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
        { value: 'America/Maceio', label: 'America/Maceio' },
        { value: 'America/Managua', label: 'America/Managua' },
        { value: 'America/Manaus', label: 'America/Manaus' },
        { value: 'America/Marigot', label: 'America/Marigot' },
        { value: 'America/Martinique', label: 'America/Martinique' },
        { value: 'America/Matamoros', label: 'America/Matamoros' },
        { value: 'America/Mazatlan', label: 'America/Mazatlan' },
        { value: 'America/Menominee', label: 'America/Menominee' },
        { value: 'America/Merida', label: 'America/Merida' },
        { value: 'America/Metlakatla', label: 'America/Metlakatla' },
        { value: 'America/Mexico_City', label: 'America/Mexico City' },
        { value: 'America/Miquelon', label: 'America/Miquelon' },
        { value: 'America/Moncton', label: 'America/Moncton' },
        { value: 'America/Monterrey', label: 'America/Monterrey' },
        { value: 'America/Montevideo', label: 'America/Montevideo' },
        { value: 'America/Montreal', label: 'America/Montreal' },
        { value: 'America/Montserrat', label: 'America/Montserrat' },
        { value: 'America/Nassau', label: 'America/Nassau' },
        { value: 'America/New_York', label: 'America/New York' },
        { value: 'America/Nipigon', label: 'America/Nipigon' },
        { value: 'America/Nome', label: 'America/Nome' },
        { value: 'America/Noronha', label: 'America/Noronha' },
        {
          value: 'America/North_Dakota/Beulah',
          label: 'America/North Dakota/Beulah'
        },
        {
          value: 'America/North_Dakota/Center',
          label: 'America/North Dakota/Center'
        },
        {
          value: 'America/North_Dakota/New_Salem',
          label: 'America/North Dakota/New Salem'
        },
        { value: 'America/Ojinaga', label: 'America/Ojinaga' },
        { value: 'America/Panama', label: 'America/Panama' },
        { value: 'America/Pangnirtung', label: 'America/Pangnirtung' },
        { value: 'America/Paramaribo', label: 'America/Paramaribo' },
        { value: 'America/Phoenix', label: 'America/Phoenix' },
        { value: 'America/Port_of_Spain', label: 'America/Port of Spain' },
        { value: 'America/Port-au-Prince', label: 'America/Port-au-Prince' },
        { value: 'America/Porto_Velho', label: 'America/Porto Velho' },
        { value: 'America/Puerto_Rico', label: 'America/Puerto Rico' },
        { value: 'America/Rainy_River', label: 'America/Rainy River' },
        { value: 'America/Rankin_Inlet', label: 'America/Rankin Inlet' },
        { value: 'America/Recife', label: 'America/Recife' },
        { value: 'America/Regina', label: 'America/Regina' },
        { value: 'America/Resolute', label: 'America/Resolute' },
        { value: 'America/Rio_Branco', label: 'America/Rio Branco' },
        { value: 'America/Santa_Isabel', label: 'America/Santa Isabel' },
        { value: 'America/Santarem', label: 'America/Santarem' },
        { value: 'America/Santiago', label: 'America/Santiago' },
        { value: 'America/Santo_Domingo', label: 'America/Santo Domingo' },
        { value: 'America/Sao_Paulo', label: 'America/Sao Paulo' },
        { value: 'America/Scoresbysund', label: 'America/Scoresbysund' },
        { value: 'America/Shiprock', label: 'America/Shiprock' },
        { value: 'America/Sitka', label: 'America/Sitka' },
        { value: 'America/St_Barthelemy', label: 'America/St Barthelemy' },
        { value: 'America/St_Johns', label: 'America/St Johns' },
        { value: 'America/St_Kitts', label: 'America/St Kitts' },
        { value: 'America/St_Lucia', label: 'America/St Lucia' },
        { value: 'America/St_Thomas', label: 'America/St Thomas' },
        { value: 'America/St_Vincent', label: 'America/St Vincent' },
        { value: 'America/Swift_Current', label: 'America/Swift Current' },
        { value: 'America/Tegucigalpa', label: 'America/Tegucigalpa' },
        { value: 'America/Thule', label: 'America/Thule' },
        { value: 'America/Thunder_Bay', label: 'America/Thunder Bay' },
        { value: 'America/Tijuana', label: 'America/Tijuana' },
        { value: 'America/Toronto', label: 'America/Toronto' },
        { value: 'America/Tortola', label: 'America/Tortola' },
        { value: 'America/Vancouver', label: 'America/Vancouver' },
        { value: 'America/Whitehorse', label: 'America/Whitehorse' },
        { value: 'America/Winnipeg', label: 'America/Winnipeg' },
        { value: 'America/Yakutat', label: 'America/Yakutat' },
        { value: 'America/Yellowknife', label: 'America/Yellowknife' },
        { value: 'Antarctica/Casey', label: 'Antarctica/Casey' },
        { value: 'Antarctica/Davis', label: 'Antarctica/Davis' },
        {
          value: 'Antarctica/DumontDUrville',
          label: 'Antarctica/DumontDUrville'
        },
        { value: 'Antarctica/Macquarie', label: 'Antarctica/Macquarie' },
        { value: 'Antarctica/Mawson', label: 'Antarctica/Mawson' },
        { value: 'Antarctica/McMurdo', label: 'Antarctica/McMurdo' },
        { value: 'Antarctica/Palmer', label: 'Antarctica/Palmer' },
        { value: 'Antarctica/Rothera', label: 'Antarctica/Rothera' },
        { value: 'Antarctica/South_Pole', label: 'Antarctica/South Pole' },
        { value: 'Antarctica/Syowa', label: 'Antarctica/Syowa' },
        { value: 'Antarctica/Vostok', label: 'Antarctica/Vostok' },
        { value: 'Arctic/Longyearbyen', label: 'Arctic/Longyearbyen' },
        { value: 'Asia/Aden', label: 'Asia/Aden' },
        { value: 'Asia/Almaty', label: 'Asia/Almaty' },
        { value: 'Asia/Amman', label: 'Asia/Amman' },
        { value: 'Asia/Anadyr', label: 'Asia/Anadyr' },
        { value: 'Asia/Aqtau', label: 'Asia/Aqtau' },
        { value: 'Asia/Aqtobe', label: 'Asia/Aqtobe' },
        { value: 'Asia/Ashgabat', label: 'Asia/Ashgabat' },
        { value: 'Asia/Baghdad', label: 'Asia/Baghdad' },
        { value: 'Asia/Bahrain', label: 'Asia/Bahrain' },
        { value: 'Asia/Baku', label: 'Asia/Baku' },
        { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
        { value: 'Asia/Beirut', label: 'Asia/Beirut' },
        { value: 'Asia/Bishkek', label: 'Asia/Bishkek' },
        { value: 'Asia/Brunei', label: 'Asia/Brunei' },
        { value: 'Asia/Choibalsan', label: 'Asia/Choibalsan' },
        { value: 'Asia/Chongqing', label: 'Asia/Chongqing' },
        { value: 'Asia/Colombo', label: 'Asia/Colombo' },
        { value: 'Asia/Damascus', label: 'Asia/Damascus' },
        { value: 'Asia/Dhaka', label: 'Asia/Dhaka' },
        { value: 'Asia/Dili', label: 'Asia/Dili' },
        { value: 'Asia/Dubai', label: 'Asia/Dubai' },
        { value: 'Asia/Dushanbe', label: 'Asia/Dushanbe' },
        { value: 'Asia/Gaza', label: 'Asia/Gaza' },
        { value: 'Asia/Harbin', label: 'Asia/Harbin' },
        { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho Chi Minh' },
        { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong' },
        { value: 'Asia/Hovd', label: 'Asia/Hovd' },
        { value: 'Asia/Irkutsk', label: 'Asia/Irkutsk' },
        { value: 'Asia/Jakarta', label: 'Asia/Jakarta' },
        { value: 'Asia/Jayapura', label: 'Asia/Jayapura' },
        { value: 'Asia/Jerusalem', label: 'Asia/Jerusalem' },
        { value: 'Asia/Kabul', label: 'Asia/Kabul' },
        { value: 'Asia/Kamchatka', label: 'Asia/Kamchatka' },
        { value: 'Asia/Karachi', label: 'Asia/Karachi' },
        { value: 'Asia/Kashgar', label: 'Asia/Kashgar' },
        { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu' },
        { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
        { value: 'Asia/Krasnoyarsk', label: 'Asia/Krasnoyarsk' },
        { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala Lumpur' },
        { value: 'Asia/Kuching', label: 'Asia/Kuching' },
        { value: 'Asia/Kuwait', label: 'Asia/Kuwait' },
        { value: 'Asia/Macau', label: 'Asia/Macau' },
        { value: 'Asia/Magadan', label: 'Asia/Magadan' },
        { value: 'Asia/Makassar', label: 'Asia/Makassar' },
        { value: 'Asia/Manila', label: 'Asia/Manila' },
        { value: 'Asia/Muscat', label: 'Asia/Muscat' },
        { value: 'Asia/Nicosia', label: 'Asia/Nicosia' },
        { value: 'Asia/Novokuznetsk', label: 'Asia/Novokuznetsk' },
        { value: 'Asia/Novosibirsk', label: 'Asia/Novosibirsk' },
        { value: 'Asia/Omsk', label: 'Asia/Omsk' },
        { value: 'Asia/Oral', label: 'Asia/Oral' },
        { value: 'Asia/Phnom_Penh', label: 'Asia/Phnom Penh' },
        { value: 'Asia/Pontianak', label: 'Asia/Pontianak' },
        { value: 'Asia/Pyongyang', label: 'Asia/Pyongyang' },
        { value: 'Asia/Qatar', label: 'Asia/Qatar' },
        { value: 'Asia/Qyzylorda', label: 'Asia/Qyzylorda' },
        { value: 'Asia/Rangoon', label: 'Asia/Rangoon' },
        { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
        { value: 'Asia/Sakhalin', label: 'Asia/Sakhalin' },
        { value: 'Asia/Samarkand', label: 'Asia/Samarkand' },
        { value: 'Asia/Seoul', label: 'Asia/Seoul' },
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai' },
        { value: 'Asia/Singapore', label: 'Asia/Singapore' },
        { value: 'Asia/Taipei', label: 'Asia/Taipei' },
        { value: 'Asia/Tashkent', label: 'Asia/Tashkent' },
        { value: 'Asia/Tbilisi', label: 'Asia/Tbilisi' },
        { value: 'Asia/Tehran', label: 'Asia/Tehran' },
        { value: 'Asia/Thimphu', label: 'Asia/Thimphu' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
        { value: 'Asia/Ulaanbaatar', label: 'Asia/Ulaanbaatar' },
        { value: 'Asia/Urumqi', label: 'Asia/Urumqi' },
        { value: 'Asia/Vientiane', label: 'Asia/Vientiane' },
        { value: 'Asia/Vladivostok', label: 'Asia/Vladivostok' },
        { value: 'Asia/Yakutsk', label: 'Asia/Yakutsk' },
        { value: 'Asia/Yekaterinburg', label: 'Asia/Yekaterinburg' },
        { value: 'Asia/Yerevan', label: 'Asia/Yerevan' },
        { value: 'Atlantic/Azores', label: 'Atlantic/Azores' },
        { value: 'Atlantic/Bermuda', label: 'Atlantic/Bermuda' },
        { value: 'Atlantic/Canary', label: 'Atlantic/Canary' },
        { value: 'Atlantic/Cape_Verde', label: 'Atlantic/Cape Verde' },
        { value: 'Atlantic/Faroe', label: 'Atlantic/Faroe' },
        { value: 'Atlantic/Madeira', label: 'Atlantic/Madeira' },
        { value: 'Atlantic/Reykjavik', label: 'Atlantic/Reykjavik' },
        { value: 'Atlantic/South_Georgia', label: 'Atlantic/South Georgia' },
        { value: 'Atlantic/St_Helena', label: 'Atlantic/St Helena' },
        { value: 'Atlantic/Stanley', label: 'Atlantic/Stanley' },
        { value: 'Australia/Adelaide', label: 'Australia/Adelaide' },
        { value: 'Australia/Brisbane', label: 'Australia/Brisbane' },
        { value: 'Australia/Broken_Hill', label: 'Australia/Broken Hill' },
        { value: 'Australia/Currie', label: 'Australia/Currie' },
        { value: 'Australia/Darwin', label: 'Australia/Darwin' },
        { value: 'Australia/Eucla', label: 'Australia/Eucla' },
        { value: 'Australia/Hobart', label: 'Australia/Hobart' },
        { value: 'Australia/Lindeman', label: 'Australia/Lindeman' },
        { value: 'Australia/Lord_Howe', label: 'Australia/Lord Howe' },
        { value: 'Australia/Melbourne', label: 'Australia/Melbourne' },
        { value: 'Australia/Perth', label: 'Australia/Perth' },
        { value: 'Australia/Sydney', label: 'Australia/Sydney' },
        { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam' },
        { value: 'Europe/Andorra', label: 'Europe/Andorra' },
        { value: 'Europe/Athens', label: 'Europe/Athens' },
        { value: 'Europe/Belgrade', label: 'Europe/Belgrade' },
        { value: 'Europe/Berlin', label: 'Europe/Berlin' },
        { value: 'Europe/Bratislava', label: 'Europe/Bratislava' },
        { value: 'Europe/Brussels', label: 'Europe/Brussels' },
        { value: 'Europe/Bucharest', label: 'Europe/Bucharest' },
        { value: 'Europe/Budapest', label: 'Europe/Budapest' },
        { value: 'Europe/Chisinau', label: 'Europe/Chisinau' },
        { value: 'Europe/Copenhagen', label: 'Europe/Copenhagen' },
        { value: 'Europe/Dublin', label: 'Europe/Dublin' },
        { value: 'Europe/Gibraltar', label: 'Europe/Gibraltar' },
        { value: 'Europe/Guernsey', label: 'Europe/Guernsey' },
        { value: 'Europe/Helsinki', label: 'Europe/Helsinki' },
        { value: 'Europe/Isle_of_Man', label: 'Europe/Isle of Man' },
        { value: 'Europe/Istanbul', label: 'Europe/Istanbul' },
        { value: 'Europe/Jersey', label: 'Europe/Jersey' },
        { value: 'Europe/Kaliningrad', label: 'Europe/Kaliningrad' },
        { value: 'Europe/Kiev', label: 'Europe/Kiev' },
        { value: 'Europe/Lisbon', label: 'Europe/Lisbon' },
        { value: 'Europe/Ljubljana', label: 'Europe/Ljubljana' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'Europe/Luxembourg', label: 'Europe/Luxembourg' },
        { value: 'Europe/Madrid', label: 'Europe/Madrid' },
        { value: 'Europe/Malta', label: 'Europe/Malta' },
        { value: 'Europe/Mariehamn', label: 'Europe/Mariehamn' },
        { value: 'Europe/Minsk', label: 'Europe/Minsk' },
        { value: 'Europe/Monaco', label: 'Europe/Monaco' },
        { value: 'Europe/Moscow', label: 'Europe/Moscow' },
        { value: 'Europe/Oslo', label: 'Europe/Oslo' },
        { value: 'Europe/Paris', label: 'Europe/Paris' },
        { value: 'Europe/Podgorica', label: 'Europe/Podgorica' },
        { value: 'Europe/Prague', label: 'Europe/Prague' },
        { value: 'Europe/Riga', label: 'Europe/Riga' },
        { value: 'Europe/Rome', label: 'Europe/Rome' },
        { value: 'Europe/Samara', label: 'Europe/Samara' },
        { value: 'Europe/San_Marino', label: 'Europe/San Marino' },
        { value: 'Europe/Sarajevo', label: 'Europe/Sarajevo' },
        { value: 'Europe/Simferopol', label: 'Europe/Simferopol' },
        { value: 'Europe/Skopje', label: 'Europe/Skopje' },
        { value: 'Europe/Sofia', label: 'Europe/Sofia' },
        { value: 'Europe/Stockholm', label: 'Europe/Stockholm' },
        { value: 'Europe/Tallinn', label: 'Europe/Tallinn' },
        { value: 'Europe/Tirane', label: 'Europe/Tirane' },
        { value: 'Europe/Uzhgorod', label: 'Europe/Uzhgorod' },
        { value: 'Europe/Vaduz', label: 'Europe/Vaduz' },
        { value: 'Europe/Vatican', label: 'Europe/Vatican' },
        { value: 'Europe/Vienna', label: 'Europe/Vienna' },
        { value: 'Europe/Vilnius', label: 'Europe/Vilnius' },
        { value: 'Europe/Volgograd', label: 'Europe/Volgograd' },
        { value: 'Europe/Warsaw', label: 'Europe/Warsaw' },
        { value: 'Europe/Zagreb', label: 'Europe/Zagreb' },
        { value: 'Europe/Zaporozhye', label: 'Europe/Zaporozhye' },
        { value: 'Europe/Zurich', label: 'Europe/Zurich' },
        { value: 'Indian/Antananarivo', label: 'Indian/Antananarivo' },
        { value: 'Indian/Chagos', label: 'Indian/Chagos' },
        { value: 'Indian/Christmas', label: 'Indian/Christmas' },
        { value: 'Indian/Cocos', label: 'Indian/Cocos' },
        { value: 'Indian/Comoro', label: 'Indian/Comoro' },
        { value: 'Indian/Kerguelen', label: 'Indian/Kerguelen' },
        { value: 'Indian/Mahe', label: 'Indian/Mahe' },
        { value: 'Indian/Maldives', label: 'Indian/Maldives' },
        { value: 'Indian/Mauritius', label: 'Indian/Mauritius' },
        { value: 'Indian/Mayotte', label: 'Indian/Mayotte' },
        { value: 'Indian/Reunion', label: 'Indian/Reunion' },
        { value: 'Pacific/Apia', label: 'Pacific/Apia' },
        { value: 'Pacific/Auckland', label: 'Pacific/Auckland' },
        { value: 'Pacific/Chatham', label: 'Pacific/Chatham' },
        { value: 'Pacific/Chuuk', label: 'Pacific/Chuuk' },
        { value: 'Pacific/Easter', label: 'Pacific/Easter' },
        { value: 'Pacific/Efate', label: 'Pacific/Efate' },
        { value: 'Pacific/Enderbury', label: 'Pacific/Enderbury' },
        { value: 'Pacific/Fakaofo', label: 'Pacific/Fakaofo' },
        { value: 'Pacific/Fiji', label: 'Pacific/Fiji' },
        { value: 'Pacific/Funafuti', label: 'Pacific/Funafuti' },
        { value: 'Pacific/Galapagos', label: 'Pacific/Galapagos' },
        { value: 'Pacific/Gambier', label: 'Pacific/Gambier' },
        { value: 'Pacific/Guadalcanal', label: 'Pacific/Guadalcanal' },
        { value: 'Pacific/Guam', label: 'Pacific/Guam' },
        { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu' },
        { value: 'Pacific/Johnston', label: 'Pacific/Johnston' },
        { value: 'Pacific/Kiritimati', label: 'Pacific/Kiritimati' },
        { value: 'Pacific/Kosrae', label: 'Pacific/Kosrae' },
        { value: 'Pacific/Kwajalein', label: 'Pacific/Kwajalein' },
        { value: 'Pacific/Majuro', label: 'Pacific/Majuro' },
        { value: 'Pacific/Marquesas', label: 'Pacific/Marquesas' },
        { value: 'Pacific/Midway', label: 'Pacific/Midway' },
        { value: 'Pacific/Nauru', label: 'Pacific/Nauru' },
        { value: 'Pacific/Niue', label: 'Pacific/Niue' },
        { value: 'Pacific/Norfolk', label: 'Pacific/Norfolk' },
        { value: 'Pacific/Noumea', label: 'Pacific/Noumea' },
        { value: 'Pacific/Pago_Pago', label: 'Pacific/Pago Pago' },
        { value: 'Pacific/Palau', label: 'Pacific/Palau' },
        { value: 'Pacific/Pitcairn', label: 'Pacific/Pitcairn' },
        { value: 'Pacific/Pohnpei', label: 'Pacific/Pohnpei' },
        { value: 'Pacific/Port_Moresby', label: 'Pacific/Port Moresby' },
        { value: 'Pacific/Rarotonga', label: 'Pacific/Rarotonga' },
        { value: 'Pacific/Saipan', label: 'Pacific/Saipan' },
        { value: 'Pacific/Tahiti', label: 'Pacific/Tahiti' },
        { value: 'Pacific/Tarawa', label: 'Pacific/Tarawa' },
        { value: 'Pacific/Tongatapu', label: 'Pacific/Tongatapu' },
        { value: 'Pacific/Wake', label: 'Pacific/Wake' },
        { value: 'Pacific/Wallis', label: 'Pacific/Wallis' },
        { value: 'UTC', label: 'UTC' }
      ],
      settings: {
        weekly_report_day: 0,
        should_weekly_email: false,
        daily_report_hour: 0,
        should_daily_email: false,
        user_timezone: ''
      }
    };
  },
  methods: {
    updateSettings() {
      this.$store.dispatch('event/UPDATE_SETTINGS', this.settings);
    },
    isSubscribed(type_id) {},

    subscribe(row, value) {
      this.$store.dispatch('event/EDIT_SUBSCRIPTION', {
        type_id: row.type_id,
        value: value
      });
    },
    findCurrentTimeZone() {
      this.settings.user_timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  },
  mounted() {
    this.$store.dispatch('event/GET_SETTINGS');
    this.settings.should_weekly_email = this.shouldWeeklyEmail;
    this.settings.should_daily_email = this.shouldDailyEmail;
    this.settings.user_timezone = this.userTimezone;
  }
};
</script>
<style>
.notification-text {
  color: rgba(255, 255, 255, 0.6);
}
</style>