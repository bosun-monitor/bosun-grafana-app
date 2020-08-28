import {substituteFinalQuery} from "./../queryBuilderService";

test('simple substitution in final query', () => {
  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$a", inputValue: "1"}
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$a", mocked_this)).toBe("1");
});

test('multiple simple substitutions in final query', () => {
  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$a", inputValue: "1", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$b", inputValue: "2", indexInUI: 1},
      {id: 2, type: "variable", inputName: "$c", inputValue: "3", indexInUI: 2}
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$a$b$c", mocked_this)).toBe("123");
});

test('multiple nested substitutions', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$a", inputValue: "1", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$b", inputValue: "$a", indexInUI: 1},
      {id: 2, type: "variable", inputName: "$c", inputValue: "$a$b", indexInUI: 2}
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$c", mocked_this)).toBe("11");
});

test('Complex substitutions', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$time", inputValue: "1h", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$tagValue", inputValue: "hello", indexInUI: 1},
      {
        id: 2, type: "queryVariable", inputValue: "$q", queryFunction: "q", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", endDuration: "2h", startDuration:"$time", grouptagBoxes: {},
        filtertagBoxes: {0: {key: "tagName", value: "$tagValue"}}, indexInUI: 2
      }
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "q(\"avg:1h-avg:example.metric{}{tagName=hello}\", \"1h\", \"2h\")"
  );
});

test('Flags', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {
        id: 0, type: "queryVariable", inputValue: "$q", queryFunction: "q", flags: "rate{counter,,1}", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", endDuration: "2h", startDuration:"$time", grouptagBoxes: {},
        filtertagBoxes: {}, indexInUI: 0
      }
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "q(\"avg:$time-avg:rate{counter,,1}:example.metric{}{}\", \"$time\", \"2h\")"
  );
});
test('reordered complex substitution', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$time", inputValue: "1h", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$tagValue", inputValue: "hello", indexInUI: 2},
      {
        id: 2, type: "queryVariable", inputValue: "$q", queryFunction: "q", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", endDuration: "2h", startDuration:"$time", grouptagBoxes: {},
        filtertagBoxes: {
          0: {key: "tagName", value: "$tagValue"}
        }, indexInUI: 1
      }
    ],
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "q(\"avg:1h-avg:example.metric{}{tagName=$tagValue}\", \"1h\", \"2h\")"
  );
});

test('error case - query function not set', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {
        id: 0, type: "queryVariable", inputValue: "$q", queryFunction: undefined, metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", endDuration: "2h", startDuration:"$time", indexInUI: 0
      }
    ],
    //Simpler than trying to mock HTMLCollection
    variableOrder: []
  };
  try{
    substituteFinalQuery("$q", mocked_this);
  }catch (e) {
    expect(e.message).toBe("Query function not set");
  }
});

test('query types with `num` arg are built correctly', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$time", inputValue: "1h", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$tagValue", inputValue: "hello1", indexInUI: 1},
      {
        id: 2, type: "queryVariable", inputValue: "$q", queryFunction: "over", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", duration: "7d", num: "3", period: "period", grouptagBoxes: {},
        filtertagBoxes: {0: {key: "tagName", value: "$tagValue"}}, indexInUI: 2
      }
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "over(\"avg:1h-avg:example.metric{}{tagName=hello1}\", \"7d\", \"period\", 3)"
  );
});

test('Group tags', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$time", inputValue: "1h", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$tagValue", inputValue: "hello1", indexInUI: 1},
      {
        id: 2, type: "queryVariable", inputValue: "$q", queryFunction: "over", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", duration: "7d", num: "3", period: "period", grouptagBoxes:
          {0: {key: "tagName1", value: "$tagValue"}, 1: {key: "tagName2", value: "hello2"}},
        filtertagBoxes: {}, indexInUI: 2
      }
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "over(\"avg:1h-avg:example.metric{tagName1=hello1,tagName2=hello2}{}\", \"7d\", \"period\", 3)"
  );
});

test('Multiple of both tag types', () => {

  const myMock = jest.fn()
  const mocked_this = new myMock();
  mocked_this.target = {
    variables: [
      {id: 0, type: "variable", inputName: "$time", inputValue: "1h", indexInUI: 0},
      {id: 1, type: "variable", inputName: "$tagValue1", inputValue: "hello1", indexInUI: 1},
      {id: 1, type: "variable", inputName: "$tagValue2", inputValue: "hello2", indexInUI: 1},
      {
        id: 2, type: "queryVariable", inputValue: "$q", queryFunction: "over", metric: "example.metric", queryAgg: "avg",
        downsampleTime: "$time", downsampleAgg: "avg", duration: "7d", num: "3", period: "period", grouptagBoxes:
          {0: {key: "groupTag1", value: "$tagValue1"}, 1: {key: "groupTag2", value: "a"}},
        filtertagBoxes: {0: {key: "filterTag1", value: "b"}, 1: {key: "filterTag2", value: "$tagValue2"}}, indexInUI: 2
      }
    ],
    variableOrder: []
  };
  expect(substituteFinalQuery("$q", mocked_this)).toBe(
    "over(\"avg:1h-avg:example.metric{groupTag1=hello1,groupTag2=a}{filterTag1=b,filterTag2=hello2}\", \"7d\", \"period\", 3)"
  );
});

