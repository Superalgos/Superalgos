
function getSideDays (timePeriod) {
  let daysOnSides

  if (timePeriod < _1_HOUR_IN_MILISECONDS) {
    daysOnSides = 1
  }

  if (timePeriod === _1_HOUR_IN_MILISECONDS) {
    daysOnSides = 9
  }

  if (timePeriod === _2_HOURS_IN_MILISECONDS) {
    daysOnSides = 10
  }

  if (timePeriod === _3_HOURS_IN_MILISECONDS) {
    daysOnSides = 12
  }

  if (timePeriod === _4_HOURS_IN_MILISECONDS) {
    daysOnSides = 20
  }

  if (timePeriod === _6_HOURS_IN_MILISECONDS) {
    daysOnSides = 35
  }

  if (timePeriod === _8_HOURS_IN_MILISECONDS) {
    daysOnSides = 44
  }

  if (timePeriod === _12_HOURS_IN_MILISECONDS) {
    daysOnSides = 56
  }

  if (timePeriod === ONE_DAY_IN_MILISECONDS) {
    daysOnSides = 154
  }

  return daysOnSides
}

function getCondenseFactor (timePeriod) {
  switch (timePeriod) {
    case _1_MINUTE_IN_MILISECONDS: return 1
    case _5_MINUTES_IN_MILISECONDS: return 5
    case _10_MINUTES_IN_MILISECONDS: return 10
    case _30_MINUTES_IN_MILISECONDS: return 50
    case _1_HOUR_IN_MILISECONDS: return 100
  }
}

function getTransparenceFactor (timePeriod) {
  switch (timePeriod) {
    case _1_MINUTE_IN_MILISECONDS: return '0.12'
    case _5_MINUTES_IN_MILISECONDS: return '0.10'
    case _10_MINUTES_IN_MILISECONDS: return '0.08'
    case _30_MINUTES_IN_MILISECONDS: return '0.06'
    case _1_HOUR_IN_MILISECONDS: return '0.04'
  }
}

function recalculatePeriod (zoomLevel) {
    // console.log(" recalculatePeriod > " + zoomLevel);

  if (zoomLevel > 200) {
    return _1_MINUTE_IN_MILISECONDS
  }

  if (zoomLevel > 120) {
    return _2_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > 80) {
    return _3_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > 60) {
    return _4_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > 15) {
    return _5_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -7) {
    return _10_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -10) {
    return _15_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -13) {
    return _20_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -15) {
    return _30_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -16) {
    return _40_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -17) {
    return _45_MINUTES_IN_MILISECONDS
  }

  if (zoomLevel > -18) {
    return _1_HOUR_IN_MILISECONDS
  }

  if (zoomLevel > -24) {
    return _2_HOURS_IN_MILISECONDS
  }

  if (zoomLevel > -25) {
    return _3_HOURS_IN_MILISECONDS
  }

  if (zoomLevel > -27) {
    return _4_HOURS_IN_MILISECONDS
  }

  if (zoomLevel > -27.5) {
    return _6_HOURS_IN_MILISECONDS
  }

  if (zoomLevel > -27.75) {
    return _8_HOURS_IN_MILISECONDS
  }

  if (zoomLevel > -28) {
    return _12_HOURS_IN_MILISECONDS
  }

  if (zoomLevel <= -28) {
    return ONE_DAY_IN_MILISECONDS
  }
  return ONE_DAY_IN_MILISECONDS
}
