<template>
  <div class="countdown">
    <div class="countdown-img-area">
      <div class="img-box" v-for="bossId in spawnList[nextSpawn].bossIds" :key="bossId">
        <img class="img-fluid" :src="bossInfo[bossId].img" alt="" />
        <div class="boss-name">{{ bossInfo[bossId].name }}</div>
      </div>
    </div>
    <audio ref="audio" preload="auto" src="/meta/dingdong.mp3" id="dingdong" @ended="onEnded"></audio>
    <div class="contdown-time-area">
      {{ timeRemain }}
      <span class="color-danger" v-show="settings.isMuted" @click="toggleSounds">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96V5.04zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"
          />
        </svg>
      </span>
      <span class="color-success" v-show="!settings.isMuted" @click="toggleSounds">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"
          />
          <path
            d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"
          />
          <path
            d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8zM7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12V4zM4.312 6.39 6 5.04v5.92L4.312 9.61A.5.5 0 0 0 4 9.5H2v-3h2a.5.5 0 0 0 .312-.11z"
          />
        </svg>
      </span>
    </div>

    <div class="spawn-list">
      <ul>
        <li class="spawn-item" v-for="(itemOfSpawnList, index) in spawnList" :key="index" :class="index == nextSpawn ? 'next-spawn' : ''">
          <span>{{ itemOfSpawnList.spawnDate }}</span>
          <!-- <span>{{ itemOfSpawnList.spawnDay }}</span> -->
          <span>{{ itemOfSpawnList.spawnTime }}</span>
          <span v-for="bossId in itemOfSpawnList.bossIds" :key="bossId">
            <img :src="bossInfo[bossId].img" alt="" />
            {{ bossInfo[bossId].name }}
          </span>
        </li>
      </ul>
    </div>

    <div class="ingame-time">
      <div class="ingame-time-bar">
        <div class="night" :style="'left: ' + ingameTime.timeBarPositon + 'px'">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div>
        <div>当前游戏内时间：{{ ingameTime.ingameTime }}</div>
        <div v-show="ingameTime.toDawn">距离天亮还有：{{ ingameTime.toDawn }} 分钟</div>
        <div v-show="ingameTime.toEvening">
          离天黑还有：{{ ingameTime.toEvening > 60 ? parseInt(ingameTime.toEvening / 60) + ' 时 ' + (ingameTime.toEvening % 60) : ingameTime.toEvening }}
          分
        </div>
      </div>
    </div>
  </div>

  <hr />
  <table class="time-table">
    <caption>
      BOSS 时间表 ASIA（GMT+9）
    </caption>
    <thead>
      <tr>
        <th>时间</th>
        <th>周一</th>
        <th>周二</th>
        <th>周三</th>
        <th>周四</th>
        <th>周五</th>
        <th>周六</th>
        <th>周日</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rowHeader in timeTable.rowHeaders" :key="rowHeader">
        <th>{{ rowHeader }}</th>
        <td v-for="index in [1, 2, 3, 4, 5, 6, 0]" :key="index">
          <span v-for="bossId in timeTable[index][rowHeader]" :key="bossId" :name="bossId" @mouseover="showBossInfo">
            {{ bossInfo[bossId].name }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { defineComponent, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'BossTimer',
  setup() {
    const settings = reactive({
      isMuted: true,
      alarms: [60],
    })
    let localSettings = localStorage.getItem('settings')
    if (localSettings) {
      try {
        localSettings = JSON.parse(localSettings)
        for (let key in localSettings) {
          settings[key] = localSettings[key]
        }
      } catch (err) {
        localStorage.removeItem('settings')
      }
    }
    const timeTable = {
      timezone: 9,
      0: {
        '00:30': ['Kutum', 'Karanda'],
        '11:00': ['Kutum', 'Karanda'],
        '14:00': ['Offin'],
        '16:00': ['Kzarka', 'Nouver'],
        '20:00': ['Kutum', 'Karanda'],
        '23:30': ['Kzarka', 'Nouver'],
      },
      1: {
        '11:00': ['Kzarka', 'Nouver'],
        '18:00': ['Kutum', 'Karanda'],
        '19:00': ['Offin'],
        '20:00': ['Kzarka', 'Nouver'],
        '23:30': ['Kutum', 'Karanda'],
      },
      2: {
        '11:00': ['Kutum', 'Karanda'],
        '18:00': ['Kzarka', 'Nouver'],
        '20:00': ['Kutum', 'Karanda'],
        '23:30': ['Kzarka', 'Nouver'],
      },
      3: {
        '11:00': ['Kzarka', 'Nouver'],
        '18:00': ['Kutum', 'Karanda'],
        '20:00': ['Kzarka', 'Nouver'],
        '23:30': ['Kutum', 'Karanda'],
      },
      4: {
        '01:00': ['Quint', 'Muraka'],
        '11:00': ['Kutum', 'Karanda'],
        '18:00': ['Kzarka', 'Nouver'],
        '20:00': ['Kutum', 'Karanda'],
        '23:30': ['Kzarka', 'Nouver'],
      },
      5: {
        '11:00': ['Kzarka', 'Nouver'],
        '18:00': ['Kutum', 'Karanda'],
        '20:00': ['Kzarka', 'Nouver'],
        '23:30': ['Kutum', 'Karanda'],
      },
      6: {
        '00:30': ['Offin'],
        '11:00': ['Kzarka', 'Nouver'],
        '16:00': ['Kutum', 'Karanda'],
        '17:00': ['Quint', 'Muraka'],
        '19:00': ['Kzarka', 'Nouver'],
      },
    }
    const bossInfo = {
      Kutum: {
        img: '/img/boss-timer/Kutum.png',
        name: '库屯',
      },
      Kzarka: {
        img: '/img/boss-timer/Kzarka.png',
        name: '克价卡',
      },
      Nouver: {
        img: '/img/boss-timer/Nouver.png',
        name: '罗裴勒',
      },
      Karanda: {
        img: '/img/boss-timer/Karanda.png',
        name: '卡岚达',
      },
      Isabella: {
        img: '/img/boss-timer/Isabella.png',
        name: '伊萨贝拉',
      },
      Quint: {
        img: '/img/boss-timer/Quint.png',
        name: '肯恩特',
      },
      Muraka: {
        img: '/img/boss-timer/Muraka.png',
        name: '木拉卡',
      },
      Offin: {
        img: '/img/boss-timer/Offin.png',
        name: '奥平',
      },
    }
    const timeOut = ref(false)
    const isPlaying = ref(false)
    getRowHeaders()
    const spawnList = reactive({})
    refreshSpawnList()
    const ingameTime = reactive({})
    refreshIngameTime()
    const nextSpawn = ref(getNextSpawn())
    const timeRemain = ref(getTimeRemain())
    const audio = ref(null)
    setInterval(() => {
      refreshIngameTime()
      nextSpawn.value = getNextSpawn()
      timeRemain.value = getTimeRemain()
    }, 1000)
    watch(nextSpawn, () => {
      refreshSpawnList()
    })
    watch(settings, () => {
      localStorage.setItem('settings', JSON.stringify(settings))
    })
    return {
      timeTable,
      bossInfo,
      ingameTime,
      spawnList,
      nextSpawn,
      timeRemain,
      toggleSounds,
      settings,
      audio,
      onEnded,
      timeOut,
      isPlaying,
      test,
    }
    // functions
    function double(a) {
      return a < 10 ? '0' + a : '' + a
    }
    function getRowHeaders() {
      const rowHeaders = {}
      for (let i = 0; i < 7; i++) {
        for (let key in timeTable[i]) {
          rowHeaders[key] = true
        }
      }
      timeTable.rowHeaders = Object.keys(rowHeaders).sort()
    }
    function refreshSpawnList(num) {
      num = num > 1 ? num : 2
      const currentTime = new Date()
      const currentTimestamp = currentTime.getTime()
      let currentDay = currentTime.getUTCDay()
      let zeroTimestamp = currentTimestamp - (currentTimestamp % (24 * 60 * 60 * 1000))
      if (timeTable.timezone < 0) {
        currentDay = currentDay == 0 ? 6 : currentDay - 1
        zeroTimestamp -= 24 * 60 * 60 * 1000
      }
      for (let i = 0; i < num; i++) {
        let day = currentDay + i > 6 ? currentDay + i - 7 : currentDay + i
        for (let key in timeTable[day]) {
          let timeOffset = parseInt(key.substr(0, 2)) * 60 + parseInt(key.substr(3, 2)) - timeTable.timezone * 60
          let timestamp = zeroTimestamp + 24 * 60 * 60 * 1000 * i + timeOffset * 60 * 1000
          // 显示从 60 分钟前开始到第二天的 boss
          if (timestamp > currentTimestamp - 60 * 60 * 1000) {
            let spawnTime = new Date(timestamp)
            spawnList[timestamp] = {
              bossIds: timeTable[day][key],
              spawnDate: '' + (spawnTime.getMonth() + 1) + '-' + spawnTime.getDate(),
              spawnDay: '周' + getLocalDay(day),
              spawnTime: '' + double(spawnTime.getHours()) + ':' + double(spawnTime.getMinutes()),
            }
          }
        }
      }
    }
    function getNextSpawn() {
      const spawnTimes = Object.keys(spawnList).sort()
      const currentTimestamp = new Date().getTime()
      for (let i = 0; i < spawnTimes.length; i++) {
        if (spawnTimes[i] > currentTimestamp) {
          return spawnTimes[i]
        }
      }
    }
    function getTimeRemain() {
      const remained = parseInt((nextSpawn.value - new Date().getTime()) / 1000),
        ss = remained % 60,
        mm = parseInt((remained / 60) % 60),
        hh = parseInt(remained / 60 / 60)
      if (settings.alarms.indexOf(remained) !== -1) {
        timeOut.value = true
      }
      return double(hh) + ':' + double(mm) + ':' + double(ss)
    }
    function refreshIngameTime() {
      const currentTime = parseInt(new Date().getTime() / 1000) % (4 * 60 * 60)
      ingameTime.timeBarPositon = -currentTime / 60 - 20
      ingameTime.timestamp = 150 * 60
      if (currentTime < 20 * 60) {
        ingameTime.timestamp += currentTime * 13.5
      } else if (currentTime < 220 * 60) {
        ingameTime.timestamp += 20 * 60 * 13.5 + (currentTime - 20 * 60) * 4.5
      } else {
        ingameTime.timestamp += 200 * 60 * 4.5 + 20 * 60 * 13.5 + (currentTime - 220 * 60) * 13.5
      }
      ingameTime.hours = parseInt((ingameTime.timestamp % (3600 * 24)) / 3600)
      ingameTime.minutes = parseInt(((ingameTime.timestamp % (3600 * 24)) % 3600) / 60)
      ingameTime.seconds = parseInt(((ingameTime.timestamp % (3600 * 24)) % 60) % 60)
      ingameTime.ingameTime = double(ingameTime.hours) + ':' + double(ingameTime.minutes) + ':' + double(ingameTime.seconds)
      ingameTime.isNight = (ingameTime.hours < 7) | (ingameTime.hours >= 22) ? true : false
      ingameTime.toDawn = parseInt(currentTime / 60) < 20 ? 20 - parseInt(currentTime / 60) : 260 - parseInt(currentTime / 60)
      if (ingameTime.toDawn > 40) {
        ingameTime.toDawn = 0
      }
      ingameTime.toEvening = parseInt(currentTime / 60) < 220 ? 220 - parseInt(currentTime / 60) : 460 - parseInt(currentTime / 60)
      if (ingameTime.toEvening > 200) {
        ingameTime.toEvening = 0
      }
    }
    function toggleSounds() {
      settings.isMuted = !settings.isMuted
    }
    function onEnded() {
      isPlaying.value = false
    }
    function test() {}
    function getLocalDay(day) {
      const localName = ['日', '一', '二', '三', '四', '五', '六']
      return localName[day]
    }
  },
  methods: {
    showBossInfo() {
      // todo
    },
    playSounds() {
      if (!this.settings.isMuted && !this.isPlaying) {
        this.audio
          .play()
          .then(() => {
            this.isPlaying = true
          })
          .catch()
      }
    },
  },
  watch: {
    timeOut: {
      handler(newState) {
        if (newState) {
          this.playSounds()
          this.timeOut = false
        }
      },
    },
    'settings.isMuted': {
      handler(newState) {
        if (!newState) {
          this.playSounds()
        }
      },
    },
  },
})

// var eventData = {
//   timezone: "9",
//   0: {
//     "02:00": "Isabella[event]",
//     "13:00": "Isabella[event]",
//   },
//   1: {
//     "01:00": "Isabella[event]",
//     "17:00": "Isabella[event]",
//   },
//   2: {
//     "00:30": "Isabella[event]",
//     "17:00": "Isabella[event]",
//   },
//   3: {
//     "00:30": "Isabella[event]",
//     "17:00": "Isabella[event]",
//   },
//   4: {
//     "00:30": "Isabella[event]",
//     "17:00": "Isabella[event]",
//   },
//   5: {
//     "00:30": "Isabella[event]",
//     "17:00": "Isabella[event]",
//   },
//   6: {
//     "01:00": "Isabella[event]",
//     "13:00": "Isabella[event]",
//   },
// };
</script>

<style lang="scss" scoped>
.countdown-img-area {
  margin: 1.5rem auto;
  display: flex;
  justify-content: center;
  max-width: 360px;
  .img-box {
    max-width: 180px;
    img {
      width: 100%;
    }
  }
  .boss-name {
    text-align: center;
    font-size: 1.25rem;
  }
}
.contdown-time-area {
  font-size: 2rem;
  text-align: center;
  svg {
    vertical-align: -0.125em;
    cursor: pointer;
  }
  .color-success {
    color: #07c160;
  }
  .color-danger {
    color: #fa5151;
  }
}

.spawn-list {
  text-align: center;
  ul {
    margin: 1rem auto;
    font-size: 1.25rem;
    line-height: 2rem;
    list-style: none;
    padding: 0;
    display: inline-block;
    li {
      text-align: start;
      white-space: nowrap;
      &.next-spawn {
        background-color: #ffc300;
      }
      span {
        padding: 0 .25rem;
      }
      img {
        max-width: 1.2rem;
        pointer-events: none;
        vertical-align: -0.125em;
      }
    }
  }
}

.ingame-time {
  font-size: 1.25rem;
  text-align: center;
  margin: 1rem 0;
  .ingame-time-bar {
    width: 240px;
    margin: 8px auto 0;
    overflow: hidden;
    border-left: #fa5151 solid 3px;
    .night {
      width: 520px;
      position: relative;
      display: flex;
      :nth-child(1),
      :nth-child(3),
      :nth-child(5) {
        background-color: #6c757d;
        width: 40px;
        height: 4px;
      }
      :nth-child(2),
      :nth-child(4) {
        background-color: #ffc300;
        height: 4px;
        width: 200px;
      }
    }
  }
}

.time-table {
  margin: 1rem auto;
  @media screen and (min-width: 960px) {
    display: table;
  }
  white-space: nowrap;
  text-align: center;
  caption {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
  td {
    span {
      display: block;
      cursor: pointer;
    }
  }
}
</style>
