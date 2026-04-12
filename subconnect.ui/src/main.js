// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'
import { Chart } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Disable datalabels globally — pie charts use the custom plugin below instead
Chart.register(ChartDataLabels)
Chart.defaults.set('plugins.datalabels', { display: false })

// Custom plugin: outside labels with pointer lines for pie/doughnut charts.
// Only activates on charts that set options.plugins.pieOutsideLabels.enabled = true
const pieOutsideLabels = {
  id: 'pieOutsideLabels',
  afterDraw(chart) {
    if (chart.config.type !== 'pie' && chart.config.type !== 'doughnut') return
    if (!chart.options.plugins?.pieOutsideLabels?.enabled) return

    const ctx = chart.ctx
    const labels = chart.data.labels || []

    chart.data.datasets.forEach((dataset, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx)
      if (meta.hidden) return

      meta.data.forEach((arc, i) => {
        const label = labels[i]
        if (!label || dataset.data[i] === 0) return

        const { x, y, startAngle, endAngle, outerRadius } = arc.getProps(
          ['x', 'y', 'startAngle', 'endAngle', 'outerRadius'],
          true // use final animation values
        )

        const midAngle = (startAngle + endAngle) / 2
        const cos = Math.cos(midAngle)
        const sin = Math.sin(midAngle)
        const isRight = cos >= 0

        // Angled line: from just outside the slice edge to a further point
        const x1 = x + (outerRadius + 6) * cos
        const y1 = y + (outerRadius + 6) * sin
        const x2 = x + (outerRadius + 22) * cos
        const y2 = y + (outerRadius + 22) * sin

        // Short horizontal tick at the end of the angled line
        const tickLen = 8
        const x3 = x2 + (isRight ? tickLen : -tickLen)
        const y3 = y2

        ctx.save()

        // Draw connector: angled segment + horizontal tick
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.strokeStyle = '#bbb'
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw label text
        ctx.fillStyle = '#1a1a2e'
        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        ctx.textAlign = isRight ? 'left' : 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, x3 + (isRight ? 3 : -3), y3)

        ctx.restore()
      })
    })
  },
}

Chart.register(pieOutsideLabels)

const app = createApp(App)

app.use(router)
app.use(VueChartkick)

app.mount('#app')
