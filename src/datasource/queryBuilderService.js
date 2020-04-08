function variableIsValid(value) {
  return value["inputName"] && value["inputName"].startsWith("$")
}

function substituteVariable(queryString, matching, replacement) {
  return queryString.split(matching).join(replacement);
}

export function substituteFinalQuery(finalQuery, controller) {
  //Ensure ordered and work upwards
  //Copy to not affect ordering
  var orderedVariablesList = controller.target.variables.slice();

  orderedVariablesList.sort((a, b) => (a.indexInUI < b.indexInUI) ? 1 : -1);

  var substitutedFinalQuery = finalQuery;
  var index = 0;
  orderedVariablesList.forEach(function (value) {
    if (value.type === "variable") {
      if (variableIsValid(value)) {
        if (value["inputValue"] === undefined) {
          substitutedFinalQuery = substituteVariable(
            substitutedFinalQuery,
            value["inputName"],
            ""
          );
        } else {
          substitutedFinalQuery = substituteVariable(
            substitutedFinalQuery,
            value["inputName"],
            value["inputValue"]
          );
        }
      }
    }
    if (value.type === "queryVariable") {
      substitutedFinalQuery = substituteVariable(
        substitutedFinalQuery, value["inputValue"],
        buildQueryVariable(orderedVariablesList, value, index, controller)
      );
    }
    index += 1;
  });
  controller.target.subbedQuery = substitutedFinalQuery;
  return substitutedFinalQuery;
}

function addQueryArg(queryVariable, arg) {
  if (queryVariable[arg]) {
    if (arg === "num") {
      return ', ' + queryVariable[arg]
    } else {
      return ', "' + queryVariable[arg] + '"'
    }
  } else {
    return ', ""'
  }
}

function ensureMinimalQuery(queryVariable) {
  if (!queryVariable) {
    throw new ReferenceError("No query parameters found")
  }
  if (!queryVariable["queryFunction"]) {
    throw new ReferenceError("Query function not set")
  }
  if (!queryVariable["queryAgg"]) {
    throw new ReferenceError("Query aggregator not set")
  }
  if (!queryVariable["metric"]) {
    throw new ReferenceError("Query metric not set")
  }
}

function addParamToQuery(queryVariable, prepend, param, append) {
  if (queryVariable[param]) {
    return prepend + queryVariable[param] + append;
  }
  return "";
}

function addTagsToQuery(constructedQuery, orderedVariablesList, index, tagType) {
  var onFirstTag = true;
  for (var tagMapping in orderedVariablesList[index][tagType + "tagBoxes"]) {
    if (orderedVariablesList[index][tagType + "tagBoxes"].hasOwnProperty(tagMapping)) {
      if (!onFirstTag) {
        constructedQuery += ","
      } else {
        onFirstTag = false;
      }
      constructedQuery +=
        orderedVariablesList[index][tagType + "tagBoxes"][tagMapping]["key"]
        + "="
        + orderedVariablesList[index][tagType + "tagBoxes"][tagMapping]["value"]
    }
  }
  return constructedQuery;
}

function buildQueryVariable(orderedVariablesList, queryVariable, index) {

  ensureMinimalQuery(queryVariable);

  var constructedQuery = queryVariable["queryFunction"] + '("' + queryVariable["queryAgg"] + ":";
  if (queryVariable["downsampleTime"]) {
    constructedQuery += queryVariable["downsampleTime"];
    constructedQuery += addParamToQuery(queryVariable, "-", "downsampleAgg", "");
  } else {
    constructedQuery += addParamToQuery(queryVariable, "", "downsampleAgg", "");
  }
  constructedQuery += addParamToQuery(queryVariable, "-", "fillPolicy", "");
  constructedQuery += addParamToQuery(queryVariable, ":", "conversionFlag", "");
  constructedQuery += addParamToQuery(queryVariable, ":", "flags", "");

  if (queryVariable["downsampleTime"] || queryVariable["downsampleAgg"] || queryVariable["fillPolicy"]) {
    constructedQuery += ":"
  }
  constructedQuery += queryVariable["metric"] + "{";

  if (orderedVariablesList[index] && orderedVariablesList[index].grouptagBoxes) {
    constructedQuery = addTagsToQuery(constructedQuery, orderedVariablesList, index, 'group')
  }
  constructedQuery += "}{";
  if (orderedVariablesList[index] && orderedVariablesList[index].filtertagBoxes) {
    constructedQuery = addTagsToQuery(constructedQuery, orderedVariablesList, index, 'filter');
  }
  constructedQuery += '}"';

  const queryVar = queryVariable["queryFunction"];
  if (queryVar === "q" || queryVar === "change" || queryVar === "count") {
    constructedQuery += addQueryArg(queryVariable, "startDuration");
    constructedQuery += addQueryArg(queryVariable, "endDuration");
  }
  if (queryVar === "band" || queryVar === "over" || queryVar === "shiftBand") {
    constructedQuery += addQueryArg(queryVariable, "duration");
    constructedQuery += addQueryArg(queryVariable, "period");
    constructedQuery += addQueryArg(queryVariable, "num");
  }
  if (queryVar === "window") {
    constructedQuery += addQueryArg(queryVariable, "duration");
    constructedQuery += addQueryArg(queryVariable, "period");
    constructedQuery += addQueryArg(queryVariable, "num");
    constructedQuery += addQueryArg(queryVariable, "funcName");
  }
  constructedQuery += ")";
  return constructedQuery;
}

