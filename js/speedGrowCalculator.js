function getCropData() {
  $.getJSON( "json/crops.json", function( data ) {
    speedGrowCalculator(data);
  });
}

function speedGrowCalculator(data) {
  var season = data.Spring;
  var month = 28;
  for(crop in season)
  {
    var actualCrop = season[crop];
    var growthStages = actualCrop.growthStages;
    actualCrop.speedGrowStages = calculateSingleGrowthTime(growthStages,true,false,false);
    actualCrop.speedGrowAgricultureStages = calculateSingleGrowthTime(growthStages,true,false,true);
    actualCrop.deluxeSpeedAgricultureStages = calculateSingleGrowthTime(growthStages,false,true,true);
    speedGrowGrowthRate = sumList(actualCrop.speedGrowStages);
    speedGrowAgricultureGrowthRate = sumList(actualCrop.speedGrowAgricultureStages);
    deluxeSpeedAgricultureGrowGrowthRate = sumList(actualCrop.deluxeSpeedAgricultureStages);
    var daysleft, daysleftMin, daysleftMax;
    if(actualCrop.reproduceTime){
      reproduceTime = season[crop].reproduceTime;
      actualCrop.speedGrowHarvest = Math.floor((month-speedGrowGrowthRate)/reproduceTime)+1;
      actualCrop.speedGrowAgricultureHarvest = Math.floor((month-speedGrowAgricultureGrowthRate)/reproduceTime)+1;
      actualCrop.deluxeSpeedAgricultureHarvest = Math.floor((month-deluxeSpeedAgricultureGrowGrowthRate)/reproduceTime)+1;
      actualCrop.speedGrowDaysLeft = daysLeft(month,speedGrowGrowthRate,actualCrop.speedGrowHarvest,reproduceTime);
      actualCrop.speedGrowAgricultureDaysLeft = daysLeft(month,speedGrowAgricultureGrowthRate,actualCrop.speedGrowAgricultureHarvest,reproduceTime);
      actualCrop.deluxeSpeedAgricultureDaysLeft = daysLeft(month,deluxeSpeedAgricultureGrowGrowthRate,actualCrop.deluxeSpeedAgricultureHarvest,reproduceTime);
    }else {
      actualCrop.speedGrowHarvest = Math.floor(month/speedGrowGrowthRate);
      actualCrop.speedGrowAgricultureHarvest = Math.floor(month/speedGrowAgricultureGrowthRate);
      actualCrop.deluxeSpeedAgricultureHarvest = Math.floor(month/deluxeSpeedAgricultureGrowGrowthRate);
      actualCrop.speedGrowDaysLeft = daysLeft(month,speedGrowGrowthRate,actualCrop.speedGrowHarvest);
      actualCrop.speedGrowAgricultureDaysLeft = daysLeft(month,speedGrowAgricultureGrowthRate,actualCrop.speedGrowAgricultureHarvest);
      actualCrop.deluxeSpeedAgricultureDaysLeft = daysLeft(month,deluxeSpeedAgricultureGrowGrowthRate,actualCrop.deluxeSpeedAgricultureHarvest);
    }
    var normalSellPrice = actualCrop.normalSellPrice;
    actualCrop.speedGrowGPD = calculateGoldPerDay(normalSellPrice,actualCrop.speedGrowHarvest,actualCrop.speedGrowDaysLeft,2,month).toFixed(2);
    actualCrop.speedGrowAgricultureGPD = calculateGoldPerDay(normalSellPrice,actualCrop.speedGrowAgricultureHarvest,actualCrop.speedGrowAgricultureDaysLeft,2,month).toFixed(2);
    actualCrop.deluxeSpeedAgricultureGPD = calculateGoldPerDay(normalSellPrice,actualCrop.deluxeSpeedAgricultureHarvest,actualCrop.deluxeSpeedAgricultureDaysLeft,2,month).toFixed(2);
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

function sumList(list) {
  return list.reduce( (prev, curr) => prev + curr );
}

function calculateSingleGrowthTime(growthStages, speedGrow, deluxeSpeedGrow, agriculturist) {
  if(speedGrow || deluxeSpeedGrow || agriculturist)
  {
    var totalGrowthTime = sumList(growthStages);
    var speedMultiplier = 0;
    if(speedGrow)
    {
      speedMultiplier = 0.1;
    }else{
      speedMultiplier = 0.25;
    }

    if(agriculturist)
    {
      speedMultiplier += 0.1;
    }
    var tempList = growthStages.slice();
    var daysRemovable = Math.ceil(speedMultiplier * totalGrowthTime);
    var tempDaysRemovable = daysRemovable;
    for(var index =0; index<tempList.length; index++)
    {
      if(index > 0 || tempList[index] > 1)
      {
        tempList[index] = tempList[index]-1;
        --daysRemovable;
      }
      if(daysRemovable <= 0)
      {
        break;
      }
    }
    return tempList;
  }
  return 0;
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
