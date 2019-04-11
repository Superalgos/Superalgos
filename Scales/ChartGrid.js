 function newChartGrid () {
   let thisObject = {
     container: undefined,
     draw: draw,
     getContainer: getContainer,
     initialize: initialize
   }

   let container = newContainer()
   container.initialize()
   thisObject.container = container

   thisObject.container.frame.width = 0
   thisObject.container.frame.height = 0

   container.frame.position.x = 0
   container.frame.position.y = 0

   container.isDraggeable = false
   container.isClickeable = true

   return thisObject

   function initialize () {

   }

   function getContainer (point) {
     let container

     container = rigthScale.getContainer(point)

     if (container !== undefined) {
       return container
     }

     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       return this.container
     } else {
            /* This point does not belong to this space. */

       return undefined
     }
   }

   function draw (container, timeLineCoordinateSystem) {
     return // not for now

     rightScaleBackground()
     leftScaleBackground()

     let periods = []
     let boxes = []
     let labels = []

     const basePeriod = {
       x: 8 * 60 * 60 * 1000,
       y: timeLineCoordinateSystem.max.y / 1000 / canvas.bottomSpace.chartAspectRatio.aspectRatio.y
     }

     let period = {
       x: basePeriod.x,
       y: basePeriod.y
     }

     calculateTimeLabels()
     printLabels(1000, 10000)

     function calculateTimeLabels () {
       periods.push(period)  // 0

       period = {
         x: basePeriod.x / 8,
         y: basePeriod.y / 10
       }

       periods.push(period)  // 1

       period = {
         x: basePeriod.x / 8 / 6,
         y: basePeriod.y / 100
       }

       periods.push(period)  // 2

       period = {
         x: basePeriod.x * 3,
         y: basePeriod.y * 10
       }

       periods.push(period)  // 3

       period = {
         x: basePeriod.x * 3 * 7,
         y: basePeriod.y * 100
       }

       periods.push(period)  // 4

            /* Period #2 Plotting */

       boxes = []
       plotGrid(periods[2])
       labels = []

            /* Label Calculation */

       for (let i = 0; i < boxes.length; i++) {
         const UPPER_PERIOD = 1

         let box = boxes[i]
         let currentValue = box.topLeft

         currentValue = unTransformThisPoint(currentValue, container)
         currentValue = timeLineCoordinateSystem.unInverseTransform(currentValue, container.frame.height)

                /* We must compare the current value on the current period, against the next period, to know which cell we are in. */

         let distanceToNextPeriod = Math.trunc((currentValue.x / periods[UPPER_PERIOD].x - Math.trunc(currentValue.x / periods[UPPER_PERIOD].x)) * 1000)

         switch (distanceToNextPeriod) {
           case 0: {
             labels.push('0')
             break
           }
           case Math.trunc(1 / 6 * 1000): {

           }
             labels.push('10')
             break
           case Math.trunc(2 / 6 * 1000): {

           }
             labels.push('20')
             break

           case Math.trunc(3 / 6 * 1000): {

           }
             labels.push('30')
             break

           case Math.trunc(4 / 6 * 1000): {

           }
             labels.push('40')
             break

           case Math.trunc(5 / 6 * 1000): {

           }
             labels.push('50')
             break

         }
       }

       printLabels(1, 150)

            /* Period #1 Plotting */

       boxes = []
       plotGrid(periods[1])
       labels = []

            /* Label Calculation */

       for (let i = 0; i < boxes.length; i++) {
         const UPPER_PERIOD = 3

         let box = boxes[i]
         let currentValue = box.topLeft

         currentValue = unTransformThisPoint(currentValue, container)
         currentValue = timeLineCoordinateSystem.unInverseTransform(currentValue, container.frame.height)

                /* We must compare the current value on the current period, against the next period, to know which cell we are in. */

         let distanceToNextPeriod = Math.trunc((currentValue.x / periods[UPPER_PERIOD].x - Math.trunc(currentValue.x / periods[UPPER_PERIOD].x)) * 1000)

         switch (distanceToNextPeriod) {
           case 0: {
             labels.push('0 Hs')
             break
           }
           case Math.trunc(1 / 24 * 1000): {

           }
             labels.push('1 Hs')
             break
           case Math.trunc(2 / 24 * 1000): {

           }
             labels.push('2 Hs')
             break

           case Math.trunc(3 / 24 * 1000): {

           }
             labels.push('3 Hs')
             break

           case Math.trunc(4 / 24 * 1000): {

           }
             labels.push('4 Hs')
             break

           case Math.trunc(5 / 24 * 1000): {

           }
             labels.push('5 Hs')
             break

           case Math.trunc(6 / 24 * 1000): {

           }
             labels.push('6 Hs')
             break

           case Math.trunc(7 / 24 * 1000): {

           }
             labels.push('7 Hs')
             break

           case Math.trunc(8 / 24 * 1000): {

           }
             labels.push('8 Hs')
             break

           case Math.trunc(9 / 24 * 1000): {

           }
             labels.push('9 Hs')
             break

           case Math.trunc(10 / 24 * 1000): {

           }
             labels.push('10 Hs')
             break

           case Math.trunc(11 / 24 * 1000): {

           }
             labels.push('11 Hs')
             break

           case Math.trunc(12 / 24 * 1000): {

           }
             labels.push('12 Hs')
             break

           case Math.trunc(13 / 24 * 1000): {

           }
             labels.push('13 Hs')
             break

           case Math.trunc(14 / 24 * 1000): {

           }
             labels.push('14 Hs')
             break

           case Math.trunc(15 / 24 * 1000): {

           }
             labels.push('15 Hs')
             break

           case Math.trunc(16 / 24 * 1000): {

           }
             labels.push('16 Hs')
             break

           case Math.trunc(17 / 24 * 1000): {

           }
             labels.push('17 Hs')
             break

           case Math.trunc(18 / 24 * 1000): {

           }
             labels.push('18 Hs')
             break

           case Math.trunc(19 / 24 * 1000): {

           }
             labels.push('19 Hs')
             break

           case Math.trunc(20 / 24 * 1000): {

           }
             labels.push('20 Hs')
             break

           case Math.trunc(21 / 24 * 1000): {

           }
             labels.push('21 Hs')
             break

           case Math.trunc(22 / 24 * 1000): {

           }
             labels.push('22 Hs')
             break

           case Math.trunc(23 / 24 * 1000): {

           }
             labels.push('23 Hs')
             break
         }
       }

       printLabels(5, 250)

            /* Period #0 Plotting */

       boxes = []
       plotGrid(periods[0])
       labels = []

            /* Label Calculation */

       for (let i = 0; i < boxes.length; i++) {
         const UPPER_PERIOD = 3

         let box = boxes[i]
         let currentValue = box.topLeft

         currentValue = unTransformThisPoint(currentValue, container)
         currentValue = timeLineCoordinateSystem.unInverseTransform(currentValue, container.frame.height)

                /* We must compare the current value on the current period, against the next period, to know which cell we are in. */

         let distanceToNextPeriod = Math.trunc((currentValue.x / periods[UPPER_PERIOD].x - Math.trunc(currentValue.x / periods[UPPER_PERIOD].x)) * 1000)

         switch (distanceToNextPeriod) {
           case 0: {
             labels.push('Morning')
             break
           }
           case Math.trunc(1 / 3 * 1000): {

           }
             labels.push('Afternoon')
             break
           case Math.trunc(2 / 3 * 1000): {

           }
             labels.push('Evening')
             break
         }
       }

       printLabels(15, 50)

            /* Period #3 Plotting */

       boxes = []
       plotGrid(periods[3])
       labels = []

            /* Label Calculation */

       for (let i = 0; i < boxes.length; i++) {
         const UPPER_PERIOD = 1

         let box = boxes[i]
         let currentValue = box.topLeft

         currentValue = unTransformThisPoint(currentValue, container)
         currentValue = timeLineCoordinateSystem.unInverseTransform(currentValue, container.frame.height)

         let date = new Date(currentValue.x)

         labels.push(date.toDateString())
       }

       printLabels(100, 2250)

            /* Period #4 Plotting */

       boxes = []
       plotGrid(periods[4])
       labels = []

            /* Label Calculation */

       for (let i = 0; i < boxes.length; i++) {
         const UPPER_PERIOD = 1

         let box = boxes[i]
         let currentValue = box.topLeft

         currentValue = unTransformThisPoint(currentValue, container)
         currentValue = timeLineCoordinateSystem.unInverseTransform(currentValue, container.frame.height)

         let date = new Date(currentValue.x)

         var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

         labels.push(monthNames[date.getMonth()] + ' ' + date.getFullYear())
       }
     }

     function plotGrid (period) {
       return

       let periodWidth = period.x
       let periodHeight = period.y

       let visiblePoint1 = {
         x: viewPort.visibleArea.topLeft.x,
         y: viewPort.visibleArea.bottomLeft.y
       }

       visiblePoint1 = unTransformThisPoint(visiblePoint1, container)
       visiblePoint1 = timeLineCoordinateSystem.unInverseTransform(visiblePoint1, container.frame.height)

       let visiblePoint2 = {
         x: viewPort.visibleArea.bottomRight.x,
         y: viewPort.visibleArea.topRight.y
       }

       visiblePoint2 = unTransformThisPoint(visiblePoint2, container)
       visiblePoint2 = timeLineCoordinateSystem.unInverseTransform(visiblePoint2, container.frame.height)

       startingPoint = {
         x: Math.trunc(visiblePoint1.x / periodWidth) * periodWidth,
         y: Math.round(Math.trunc(visiblePoint1.y / periodHeight) * periodHeight * 100000) / 100000
       }

       endingPoint = {
         x: Math.trunc(visiblePoint2.x / periodWidth) * periodWidth,
         y: Math.trunc(visiblePoint2.y / periodHeight) * periodHeight
       }

       let lineWidth

       if (viewPort.zoomLevel > 0) {
         lineWidth = period.x / basePeriod.x + period.x / basePeriod.x * viewPort.zoomLevel / 20
       } else {
         lineWidth = period.x / basePeriod.x + period.x / basePeriod.x * viewPort.zoomLevel / 80
       }

       if (lineWidth < 0.7) {
         return
       }

       if (lineWidth > 1.4) {
         lineWidth = 1.4
       }

       browserCanvasContext.beginPath()

       let y1
       let y2

       let lastRightLabelPosition = {
         x: 0,
         y: 0
       }

       let lastLeftLabelPosition = {
         x: 0,
         y: 0
       }

       for (var j = startingPoint.y; j <= endingPoint.y + periodHeight; j = j + periodHeight) {
         if (j >= 0 && j <= timeLineCoordinateSystem.max.y) {
           let point1 = {
             x: visiblePoint1.x,
             y: j
           }

           let point2 = {
             x: visiblePoint2.x,
             y: j
           }

           point1 = timeLineCoordinateSystem.transformThisPoint(point1)
           point2 = timeLineCoordinateSystem.transformThisPoint(point2)

           point1 = transformThisPoint(point1, container)
           point2 = transformThisPoint(point2, container)

           if (point1.y >= viewPort.visibleArea.topLeft.y) {
                        /* Here we keep the last two positive valued of y */

             y2 = y1
             y1 = point1.y
           }

           point1 = viewPort.fitIntoVisibleArea(point1)
           point2 = viewPort.fitIntoVisibleArea(point2)

           browserCanvasContext.moveTo(point1.x, point1.y)
           browserCanvasContext.lineTo(point2.x, point2.y)

                    /* Now we put the scale on the right side of the chart */

           drawRigthScale()
           drawLeftScale()

           function drawRigthScale () {
                        /* And now the scale. */

             let fontSize = 10

             let label = ' ' + Math.round(j * 1) / 1
             label = Number(label).toLocaleString()

             let labelPoint = {
               x: viewPort.visibleArea.bottomRight.x + 5,
               y: point1.y + fontSize / 2 * FONT_ASPECT_RATIO
             }

             if (Math.abs(lastRightLabelPosition.y - labelPoint.y > fontSize || lastRightLabelPosition.y === 0)) {
               if (labelPoint.y > viewPort.visibleArea.topLeft.y + fontSize && labelPoint.y < viewPort.visibleArea.bottomRight.y - fontSize) {
                 browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
                 browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
                 browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
               }
             }

             lastRightLabelPosition.x = labelPoint.x
             lastRightLabelPosition.y = labelPoint.y
           }

           function drawLeftScale () {
             let fontSize = 10

                        /*
                        j is a value between 0 and the max y on the scale of the products.
                        If we want to convert j to the scale of profits we need to apply the following formula:
                        */

             let labelValue = (j - timeLineCoordinateSystem.max.y / 2) * 200 / timeLineCoordinateSystem.max.y
             labelValue = Math.round(labelValue * 100) / 100
             if (labelValue > 0) { labelValue = '+' + labelValue }
             if (parseInt(labelValue) > -10 && parseInt(labelValue) < 10) { labelValue = ' ' + labelValue }
             if (parseInt(labelValue) === 0) { labelValue = ' ' + labelValue }
             let label = ' ' + pad(labelValue, 3) + '%'

             let labelPoint = {
               x: 0,
               y: point1.y + fontSize / 2 * FONT_ASPECT_RATIO
             }

             if (Math.abs(lastLeftLabelPosition.y - labelPoint.y > fontSize || lastLeftLabelPosition.y === 0)) {
               if (labelPoint.y > viewPort.visibleArea.topLeft.y + fontSize && labelPoint.y < viewPort.visibleArea.bottomRight.y - fontSize) {
                 browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
                 browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
                 browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
               }
             }

             lastLeftLabelPosition.x = labelPoint.x
             lastLeftLabelPosition.y = labelPoint.y
           }
         }
       }

       let x1
       let x2

       for (var i = startingPoint.x; i <= endingPoint.x + periodWidth; i = i + periodWidth) {
         let point3 = {
           x: i,
           y: 0
         }

         let point4 = {
           x: i,
           y: timeLineCoordinateSystem.max.y
         }

         point3 = timeLineCoordinateSystem.transformThisPoint(point3)
         point4 = timeLineCoordinateSystem.transformThisPoint(point4)

         point3 = transformThisPoint(point3, container)
         point4 = transformThisPoint(point4, container)

                /* Here we keep the last two positive valued of y */

         x2 = x1
         x1 = point3.x

         if (x2 !== undefined) {
           let topLeft = {
             x: x2,
             y: y1
           }

           let bottomRight = {
             x: x1,
             y: y2
           }

           let box = {
             topLeft: topLeft,
             bottomRight: bottomRight
           }
           boxes.push(box)
         }

                /* Painting the lines */

         point3 = viewPort.fitIntoVisibleArea(point3)
         point4 = viewPort.fitIntoVisibleArea(point4)

         browserCanvasContext.moveTo(point3.x, point3.y)
         browserCanvasContext.lineTo(point4.x, point4.y)
       }

       browserCanvasContext.closePath()
       browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.05' + Math.trunc(lineWidth + 1) + ')'

       browserCanvasContext.lineWidth = lineWidth

       browserCanvasContext.stroke()
     }

     function printLabels (baseZoomFilter, maxZoom) {
       let zoomFilter = viewPort.zoomFontSize(baseZoomFilter)

       if (zoomFilter < 7 || zoomFilter > maxZoom) {
         return
       }

       for (let i = 0; i < boxes.length; i++) {
         let label = labels[i]

         if (label === undefined) {
           label = 'undefined'
         }

         let fontSize = 10

         let labelPoint = {
           x: boxes[i].topLeft.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
           y: viewPort.visibleArea.topLeft.y - fontSize / 2 + 1
         }

         let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO

         browserCanvasContext.beginPath()

         browserCanvasContext.rect(labelPoint.x, labelPoint.y - fontSize, xOffset * 2, fontSize)
         browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
         browserCanvasContext.fill()

         browserCanvasContext.closePath()

         browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
         browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
         browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
       }

       browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
       browserCanvasContext.beginPath()
       browserCanvasContext.rect(0, TOP_SPACE_HEIGHT, viewPort.visibleArea.topLeft.x, viewPort.visibleArea.topLeft.y - TOP_SPACE_HEIGHT)
       browserCanvasContext.rect(viewPort.visibleArea.topRight.x, TOP_SPACE_HEIGHT, 500, viewPort.visibleArea.topLeft.y - TOP_SPACE_HEIGHT)
       browserCanvasContext.closePath()
       browserCanvasContext.fill()
     }

     function rightScaleBackground () {
       const RIGHT_MARGIN = 50

            /* We will paint some transparent background here. */

       let opacity = '0.95'

       browserCanvasContext.beginPath()

       browserCanvasContext.rect(viewPort.visibleArea.topRight.x, viewPort.visibleArea.topRight.y, RIGHT_MARGIN, viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y)
       browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'

       browserCanvasContext.closePath()

       browserCanvasContext.fill()
     }

     function leftScaleBackground () {
       const LEFT_MARGIN = 50

            /* We will paint some transparent background here. */

       let opacity = '0.95'

       browserCanvasContext.beginPath()

       browserCanvasContext.rect(0, viewPort.visibleArea.topRight.y, LEFT_MARGIN, viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y)
       browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'

       browserCanvasContext.closePath()

       browserCanvasContext.fill()
     }
   }
 }
