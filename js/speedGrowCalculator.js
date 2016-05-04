getCropData = function() {
  $.getJSON( "json/crops.json", function( data ) {
    speedGrowCalculator(data);
  });
};

speedGrowCalculator = function(data) {
  var season = data.Spring;
  var month = 28;
  for(crop in season)
  {
    var actualCrop = season[crop];
    minSpeed = calculateSingleGrowthTime(season[crop].growthStages,true,false,false);
    speed = calculateSingleGrowthTime(season[crop].growthStages,true,false,true);
    maxSpeed = calculateSingleGrowthTime(season[crop].growthStages,true,false,true);
    var daysleft, daysleftMin, daysleftMax;
    if(actualCrop.reproduceTime){
      reproduceTime = season[crop].reproduceTime;
      minHarvest = Math.floor((month-minSpeed)/reproduceTime)+1;
      harvest = Math.floor((month-speed)/reproduceTime)+1;
      maxHarvest = Math.floor((month-maxSpeed)/reproduceTime)+1;
      daysleftMin = daysLeft(month,minSpeed,minHarvest,reproduceTime);
      daysleft = daysLeft(month,speed,harvest,reproduceTime);
      daysleftMax = daysLeft(month,maxSpeed,maxHarvest,reproduceTime);
    }else {
      minHarvest = Math.floor(month/minSpeed);
      harvest = Math.floor(month/speed);
      maxHarvest = Math.floor(month/maxSpeed);
      daysleftMin = daysLeft(month,minSpeed,minHarvest);
      daysleft = daysLeft(month,speed,harvest);
      daysleftMax = daysLeft(month,maxSpeed,maxHarvest);
    }
    var normalSellPrice = actualCrop.normalSellPrice;
    console.log(actualCrop.name);
    console.log("G/D Minimium: " + calculateGoldPerDay(normalSellPrice,minHarvest,daysleftMin,2,month));
    console.log("G/D Medium: " + calculateGoldPerDay(normalSellPrice,harvest,daysleft,2,month));
    console.log("G/D Maximum: " + calculateGoldPerDay(normalSellPrice,maxHarvest,daysleftMax,2,month));
    console.log();
    console.log(season[crop].name + ":{");
    console.log("Speed Grow: \n{\n Growth Time: " + minSpeed + "\n Max Harvest: " + minHarvest + "\n Days Left: " + daysleftMin + "\n}");
    console.log("Speed Grow & Agriculturist: {\n Growth Time: " + speed + "\n Max Harvest: " + harvest + "\n Days Left: " + daysleft +"\n}");
    console.log("Max Grow: {\n Growth Time: " + maxSpeed + "\n Max Harvest: " + maxHarvest + "\n Days Left: " + daysleftMax + "\n}\n}");
  }
};
calculateGoldPerDay = function(sellPrice,harvest,daysLeft,minDaysLeft,month) {
  if(daysLeft<minDaysLeft)
  {
    return (sellPrice*harvest)/month;
  }else {
    return (sellPrice*harvest)/(month-daysLeft)
  }
}

daysLeft = function(month,speed,harvest,reproduceTime) {
  if(reproduceTime){
    return month-speed-reproduceTime*(harvest-1);
  } else {
    return month-harvest*speed;
  }
};

calculateSingleGrowthTime = function(growthStages, speedGrow, deluxeSpeedGrow, agriculturist) {
  if(speedGrow || deluxeSpeedGrow || agriculturist)
  {
    var totalGrowthTime = growthStages.reduce( (prev, curr) => prev + curr );
    var speedMultiplier = 0;
    if(speedGrow)
    {
      speedMultiplier = 0.1;
    }else{
      speedMultiplier = 0.25;
    }

    if(agriculturist)
      speedMultiplier += 0.1;
    var daysRemovable = Math.ceil(speedMultiplier * totalGrowthTime);
    var stageGrowthDays = growthStages.length;
    for(var stage=0;stage<growthStages;stage++)
    {
      if(stage > 0 || growthStages.length > 1)
      {
        stageGrowthDays -= 1;
        daysRemovable -= 1;
      }
      if(daysRemovable < 1)
      {
        break;
      }
    }
    return totalGrowthTime-daysRemovable;
  }
};
