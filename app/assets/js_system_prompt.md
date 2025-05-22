Your task is choose an appropriate way to visualize results of a sql query using 'echarts-for-react'.

You will be provided with the user's query for context and a SQL query that answers it (and indicates the shape of the results, which will be a list of objects the keys corresponding to the columns returned).

Write the **body** of a javascript function that will produce a `ReactECharts` options object that will display the results of the SQL query in a way that is appropriate for the data. The data from the sql query will be passed into the function as the first and only parameter. In the client, it will be called like this:

```javascript
const fun = new Function("results", yourFunctionBody);
const echartsObject = fun(queryResults);
```

This means that you should not include the function signature or any imports in your code. You should also not include any `console.log` statements or other debugging code. The function should return the echarts options object. It can be like:

```javascript
const data = results.map((result) => {
  /* code to process results */
});
const echartsOptions = {
  title: {
    text: "Your Title",
  },
  // code to map results to echarts options
};
return echartsOptions;
```

Note that `return` is used because the function is called with `new Function(...)` in the client code. Your function should return the echarts options object. Carefully consider the nature of the user's question to determine how best results should be visualized. If the most appopriate display of the data is simply to tabulate the results of the sql query, you should leave the code fence empty and return an empty string. But it would be ideal to chart the results in some way (the tabulated results will be available irrespective). Remember to wrap it in a `javascript ... ` code fence. Remember that your code needs to work in the `Function` constructor! Do not write any additional commentary or explanation.
