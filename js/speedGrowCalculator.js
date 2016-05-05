function getCropData() {
  $.getJSON( "json/crops.json", function( data ) {
    speedGrowCalculator(data);
  });
};

function speedGrowCalculator(data) {
  var season = data.Spring;
  var month = 28;
  for(crop in season)
  {
    var actualCrop = season[crop];
    speedGrowGrowthRate = calculateSingleGrowthTime(season[crop].growthStages,true,false,false);
    speedGrowAgricultureGrowthRate = calculateSingleGrowthTime(season[crop].growthStages,true,false,true);
    deluxeSpeedAgricultureGrowGrowthRate = calculateSingleGrowthTime(season[crop].growthStages,true,false,true);
    var daysleft, daysleftMin, daysleftMax;
    if(actualCrop.reproduceTime){
      reproduceTime = season[crop].reproduceTime;
      actualCrop.speedGrowHarvest = Math.floor((month-speedGrowGrowthRate)/reproduceTime)+1;
      actualCrop.speedGrowAgricultureHarvest = Math.floor((month-speedGrowAgricultureGrowthRate)/reproduceTime)+1;
      actualCrop.deluxeSpeedAgricultureHarvest = Math.floor((month-deluxeSpeedAgricultureGrowGrowthRate)/reproduceTime)+1;
      actualCrop.daysleftMin = daysLeft(month,speedGrowGrowthRate,actualCrop.speedGrowHarvest,reproduceTime);
      actualCrop.daysleft = daysLeft(month,speedGrowAgricultureGrowthRate,actualCrop.speedGrowAgricultureHarvest,reproduceTime);
      actualCrop.daysleftMax = daysLeft(month,deluxeSpeedAgricultureGrowGrowthRate,actualCrop.deluxeSpeedAgricultureHarvest,reproduceTime);
    }else {
      actualCrop.speedGrowHarvest = Math.floor(month/speedGrowGrowthRate);
      actualCrop.speedGrowAgricultureHarvest = Math.floor(month/speedGrowAgricultureGrowthRate);
      actualCrop.deluxeSpeedAgricultureHarvest = Math.floor(month/deluxeSpeedAgricultureGrowGrowthRate);
      actualCrop.daysleftMin = daysLeft(month,speedGrowGrowthRate,actualCrop.speedGrowHarvest);
      actualCrop.daysleft = daysLeft(month,speedGrowAgricultureGrowthRate,actualCrop.speedGrowAgricultureHarvest);
      actualCrop.daysleftMax = daysLeft(month,deluxeSpeedAgricultureGrowGrowthRate,actualCrop.deluxeSpeedAgricultureHarvest);
    }
    var normalSellPrice = actualCrop.normalSellPrice;
    actualCrop.minGPD = calculateGoldPerDay(normalSellPrice,actualCrop.speedGrowHarvest,actualCrop.daysleftMin,2,month).toFixed(2);
    actualCrop.normalGPD = calculateGoldPerDay(normalSellPrice,actualCrop.speedGrowAgricultureHarvest,actualCrop.daysleft,2,month).toFixed(2);
    actualCrop.maxGPD = calculateGoldPerDay(normalSellPrice,actualCrop.deluxeSpeedAgricultureHarvest,actualCrop.daysleftMax,2,month).toFixed(2);
    actualCrop.speedGrowGrowthRate = speedGrowGrowthRate;
    actualCrop.speedGrowAgricultureGrowthRate = speedGrowAgricultureGrowthRate;
    actualCrop.deluxeSpeedAgricultureGrowGrowthRate = deluxeSpeedAgricultureGrowGrowthRate;
  }
  var str = JSON.stringify(season, undefined, 4)
  output(syntaxHighlight(str));
}

function calculateGoldPerDay(sellPrice,harvest,daysLeft,minDaysLeft,month) {
  if(daysLeft<minDaysLeft)
  {
    return (sellPrice*harvest)/month;
  }else {
    return (sellPrice*harvest)/(month-daysLeft)
  }
}

function daysLeft(month,speed,harvest,reproduceTime) {
  if(reproduceTime){
    return month-speed-reproduceTime*(harvest-1);
  } else {
    return month-harvest*speed;
  }
}

function calculateSingleGrowthTime(growthStages, speedGrow, deluxeSpeedGrow, agriculturist) {
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
}


function output(inp) {
    document.body.appendChild(document.createElement('pre')).innerHTML = inp;
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
