// Assignment Checker - Charts Component

class ChartsComponent {
    constructor() {
        this.charts = new Map();
        this.defaultColors = [
            '#4f46e5', '#06b6d4', '#10b981', '#f59e0b',
            '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'
        ];
    }

    // Create a donut chart
    createDonutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Chart container not found:', containerId);
            return null;
        }

        const chartOptions = {
            type: 'donut',
            centerText: '',
            showLabels: true,
            showValues: true,
            showPercentages: true,
            colors: this.defaultColors,
            strokeWidth: 8,
            size: 200,
            ...options
        };

        const chart = this.renderDonutChart(container, data, chartOptions);
        this.charts.set(containerId, { chart, data, options: chartOptions });
        return chart;
    }

    // Create a bar chart
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Chart container not found:', containerId);
            return null;
        }

        const chartOptions = {
            type: 'bar',
            orientation: 'vertical',
            showGrid: true,
            showAxes: true,
            showValues: true,
            colors: this.defaultColors,
            barWidth: 0.7,
            ...options
        };

        const chart = this.renderBarChart(container, data, chartOptions);
        this.charts.set(containerId, { chart, data, options: chartOptions });
        return chart;
    }

    // Create a line chart
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Chart container not found:', containerId);
            return null;
        }

        const chartOptions = {
            type: 'line',
            showGrid: true,
            showAxes: true,
            showPoints: true,
            lineWidth: 2,
            pointRadius: 4,
            colors: this.defaultColors,
            smooth: true,
            ...options
        };

        const chart = this.renderLineChart(container, data, chartOptions);
        this.charts.set(containerId, { chart, data, options: chartOptions });
        return chart;
    }

    // Render donut chart
    renderDonutChart(container, data, options) {
        const svg = this.createSVG(container, options.size, options.size);
        const centerX = options.size / 2;
        const centerY = options.size / 2;
        const radius = (options.size - options.strokeWidth) / 2 - 10;

        let total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -90; // Start from top

        // Create segments
        data.forEach((item, index) => {
            const percentage = (item.value / total) * 100;
            const segmentAngle = (item.value / total) * 360;
            const color = options.colors[index % options.colors.length];

            // Create arc path
            const startAngle = currentAngle;
            const endAngle = currentAngle + segmentAngle;
            
            const startX = centerX + radius * Math.cos(this.degreesToRadians(startAngle));
            const startY = centerY + radius * Math.sin(this.degreesToRadians(startAngle));
            const endX = centerX + radius * Math.cos(this.degreesToRadians(endAngle));
            const endY = centerY + radius * Math.sin(this.degreesToRadians(endAngle));

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
            ].join(' ');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#ffffff');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('class', 'chart-segment');
            path.style.transition = 'all 0.3s ease';

            // Add hover effects
            path.addEventListener('mouseenter', () => {
                path.style.filter = 'brightness(1.1)';
                this.showTooltip(item.label, item.value, percentage);
            });

            path.addEventListener('mouseleave', () => {
                path.style.filter = 'brightness(1)';
                this.hideTooltip();
            });

            svg.appendChild(path);
            currentAngle += segmentAngle;
        });

        // Add center text
        if (options.centerText) {
            const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            centerText.setAttribute('x', centerX);
            centerText.setAttribute('y', centerY);
            centerText.setAttribute('text-anchor', 'middle');
            centerText.setAttribute('dominant-baseline', 'middle');
            centerText.setAttribute('class', 'chart-center-text');
            centerText.textContent = options.centerText;
            svg.appendChild(centerText);
        }

        // Add legend if enabled
        if (options.showLabels) {
            this.addLegend(container, data, options.colors);
        }

        return svg;
    }

    // Render bar chart
    renderBarChart(container, data, options) {
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = this.createSVG(container, width, height);
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(chartGroup);

        // Calculate scales
        const maxValue = Math.max(...data.map(d => d.value));
        const barWidth = chartWidth / data.length * options.barWidth;
        const barSpacing = (chartWidth / data.length) * (1 - options.barWidth);

        // Draw bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = index * (chartWidth / data.length) + barSpacing / 2;
            const y = chartHeight - barHeight;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', options.colors[index % options.colors.length]);
            rect.setAttribute('class', 'chart-bar');
            rect.style.transition = 'all 0.3s ease';

            // Add hover effects
            rect.addEventListener('mouseenter', () => {
                rect.style.filter = 'brightness(1.1)';
                this.showTooltip(item.label, item.value);
            });

            rect.addEventListener('mouseleave', () => {
                rect.style.filter = 'brightness(1)';
                this.hideTooltip();
            });

            chartGroup.appendChild(rect);

            // Add value labels
            if (options.showValues) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + barWidth / 2);
                text.setAttribute('y', y - 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('class', 'chart-value-label');
                text.textContent = item.value;
                chartGroup.appendChild(text);
            }

            // Add category labels
            const categoryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            categoryText.setAttribute('x', x + barWidth / 2);
            categoryText.setAttribute('y', chartHeight + 20);
            categoryText.setAttribute('text-anchor', 'middle');
            categoryText.setAttribute('class', 'chart-category-label');
            categoryText.textContent = item.label;
            chartGroup.appendChild(categoryText);
        });

        // Draw axes
        if (options.showAxes) {
            this.drawAxes(chartGroup, chartWidth, chartHeight, maxValue);
        }

        // Draw grid
        if (options.showGrid) {
            this.drawGrid(chartGroup, chartWidth, chartHeight, maxValue);
        }

        return svg;
    }

    // Render line chart
    renderLineChart(container, data, options) {
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = this.createSVG(container, width, height);
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        svg.appendChild(chartGroup);

        // Calculate scales
        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const valueRange = maxValue - minValue;

        // Create path data
        let pathData = '';
        const points = [];

        data.forEach((item, index) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - ((item.value - minValue) / valueRange) * chartHeight;
            
            points.push({ x, y, value: item.value, label: item.label });
            
            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                if (options.smooth) {
                    // Add smooth curve
                    const prevPoint = points[index - 1];
                    const cp1x = prevPoint.x + (x - prevPoint.x) / 3;
                    const cp1y = prevPoint.y;
                    const cp2x = x - (x - prevPoint.x) / 3;
                    const cp2y = y;
                    pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
        });

        // Draw line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', options.colors[0]);
        path.setAttribute('stroke-width', options.lineWidth);
        path.setAttribute('class', 'chart-line');
        chartGroup.appendChild(path);

        // Draw points
        if (options.showPoints) {
            points.forEach(point => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', point.x);
                circle.setAttribute('cy', point.y);
                circle.setAttribute('r', options.pointRadius);
                circle.setAttribute('fill', options.colors[0]);
                circle.setAttribute('stroke', '#ffffff');
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('class', 'chart-point');
                circle.style.transition = 'all 0.3s ease';

                // Add hover effects
                circle.addEventListener('mouseenter', () => {
                    circle.setAttribute('r', options.pointRadius + 2);
                    this.showTooltip(point.label, point.value);
                });

                circle.addEventListener('mouseleave', () => {
                    circle.setAttribute('r', options.pointRadius);
                    this.hideTooltip();
                });

                chartGroup.appendChild(circle);
            });
        }

        // Draw axes
        if (options.showAxes) {
            this.drawAxes(chartGroup, chartWidth, chartHeight, maxValue, minValue);
        }

        // Draw grid
        if (options.showGrid) {
            this.drawGrid(chartGroup, chartWidth, chartHeight, maxValue, minValue);
        }

        return svg;
    }

    // Helper methods
    createSVG(container, width, height) {
        container.innerHTML = ''; // Clear previous chart
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('class', 'chart-svg');
        
        container.appendChild(svg);
        return svg;
    }

    drawAxes(group, width, height, maxValue, minValue = 0) {
        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', height);
        yAxis.setAttribute('stroke', '#e5e7eb');
        yAxis.setAttribute('stroke-width', '1');
        group.appendChild(yAxis);

        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', height);
        xAxis.setAttribute('x2', width);
        xAxis.setAttribute('y2', height);
        xAxis.setAttribute('stroke', '#e5e7eb');
        xAxis.setAttribute('stroke-width', '1');
        group.appendChild(xAxis);

        // Y-axis labels
        const steps = 5;
        for (let i = 0; i <= steps; i++) {
            const value = minValue + (maxValue - minValue) * (i / steps);
            const y = height - (i / steps) * height;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -10);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('class', 'chart-axis-label');
            text.textContent = Math.round(value);
            group.appendChild(text);
        }
    }

    drawGrid(group, width, height, maxValue, minValue = 0) {
        const steps = 5;
        
        // Horizontal grid lines
        for (let i = 0; i <= steps; i++) {
            const y = (i / steps) * height;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#f3f4f6');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('class', 'chart-grid-line');
            group.appendChild(line);
        }
    }

    addLegend(container, data, colors) {
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        
        data.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'chart-legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'chart-legend-color';
            colorBox.style.backgroundColor = colors[index % colors.length];
            
            const label = document.createElement('span');
            label.className = 'chart-legend-label';
            label.textContent = item.label;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        container.appendChild(legend);
    }

    showTooltip(label, value, percentage = null) {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        let content = `<strong>${label}</strong><br>Value: ${value}`;
        if (percentage !== null) {
            content += `<br>Percentage: ${percentage.toFixed(1)}%`;
        }

        tooltip.innerHTML = content;
        tooltip.style.display = 'block';
        tooltip.style.opacity = '1';

        // Position tooltip near mouse
        document.addEventListener('mousemove', this.positionTooltip);
    }

    hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 200);
        }
        document.removeEventListener('mousemove', this.positionTooltip);
    }

    positionTooltip(e) {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 10 + 'px';
        }
    }

    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Update chart data
    updateChart(containerId, newData, animate = true) {
        const chartInfo = this.charts.get(containerId);
        if (!chartInfo) {
            console.error('Chart not found:', containerId);
            return;
        }

        chartInfo.data = newData;
        
        if (animate && AnimationUtils.isAnimationsEnabled()) {
            // Animate chart update
            const container = document.getElementById(containerId);
            AnimationUtils.fadeOut(chartInfo.chart, 'fast').then(() => {
                this.rerenderChart(containerId);
                AnimationUtils.fadeIn(chartInfo.chart, 'fast');
            });
        } else {
            this.rerenderChart(containerId);
        }
    }

    rerenderChart(containerId) {
        const chartInfo = this.charts.get(containerId);
        if (!chartInfo) return;

        const container = document.getElementById(containerId);
        
        switch (chartInfo.options.type) {
            case 'donut':
                this.renderDonutChart(container, chartInfo.data, chartInfo.options);
                break;
            case 'bar':
                this.renderBarChart(container, chartInfo.data, chartInfo.options);
                break;
            case 'line':
                this.renderLineChart(container, chartInfo.data, chartInfo.options);
                break;
        }
    }

    // Remove chart
    removeChart(containerId) {
        const chartInfo = this.charts.get(containerId);
        if (chartInfo) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
            this.charts.delete(containerId);
        }
    }

    // Get chart data
    getChartData(containerId) {
        const chartInfo = this.charts.get(containerId);
        return chartInfo ? chartInfo.data : null;
    }

    // Animate chart appearance
    animateChartIn(containerId) {
        const container = document.getElementById(containerId);
        if (container && AnimationUtils.isAnimationsEnabled()) {
            AnimationUtils.scaleIn(container, 'normal');
        }
    }

    // Export chart as image
    exportChart(containerId, filename = 'chart.png') {
        const chartInfo = this.charts.get(containerId);
        if (!chartInfo) return;

        const svg = chartInfo.chart;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            URL.revokeObjectURL(svgUrl);
        };
        img.src = svgUrl;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsComponent;
}
