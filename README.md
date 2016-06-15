## Bosun app

The Bosun app currently provides a datasource for Bosun, and a panel to list open incidents. This plugin replaces the datasource plugin.

## Bosun datasource
Bosun datasource plugin for Grafana 3.0 and later

This plugin turns [Bosun](http://bosun.org) into a datasource for Grafana 3.0 and later. This means you can use any [Bosun expression](http://bosun.org/expressions) to generate cool dashboards which are not possible with OpenTSDB alone.

### Usage

The datasource provides 2 special variables that make easier to integrate the expressions in Grafana:
* $ds - the suggested downsampling interval for use in your queries
* $start - it's replaced by the starting time selected by the user in Grafana

Sample code to generate percent of free space for each partition:

```
$free = q("avg:$ds-avg:os.disk.fs.space_free{disk=*,host=backup}", "$start", "")
$total = q("avg:$ds-avg:os.disk.fs.space_total{disk=*,host=backup}", "$start", "")
$free / $total
```

![Sample query](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-datasource/master/src/screenshots/sample-query.png)

Aliases can make use of variables in the format ```$tag_<tagname>``` to use the timeseries' respective tag values on legend. On the above example we use ```$tag_disk``` and ```$tag_host```

It's also possible to use any other templated variable in your queries, the same way it's possible on other datasources


### Templating
The following functions can be used in a query for template variables:
* tagvalues(metric.name, tagname):  ```tagvalues(os.load, host)```
* tagkeys(metric.name): ```tagkeys(os.load)```

![Templating variable](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-datasource/master/src/screenshots/templating.png)

### Annotations
Grafana can display annotations created inside Bosun, which may add more context to strange metrics behaviour.

![Annotations query](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-app/master/src/screenshots/annotations-query.png)

They can be filtered by any of the fields available in Bosun, and will be displayed like a standard annotation in Grafana.

![Annotations in Grafana](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-app/master/src/screenshots/grafana-annotation.png)

### Query helper
If you use Bosun to index data from OpenTSDB, it's possible to enable the Query Helper on data source configuration.

![Enabling query helper](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-datasource/master/src/screenshots/query-helper-config.png)

Doing that enables a helper tool that is able to generate queries using metadata from Bosun. This makes it a lot easier to write your expressions.

## Incident List
The plugin includes a custom panel that enable Grafana users to interact with Bosun incidents.

![Incident Panel](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-app/master/src/screenshots/incident-list.png)

You can query Bosun and display only incidents related to other information displayed on the dashboard, filtering by tags keys/value, incident status (Normal, Warning, Critical), alert name, among other fields. The user can then interact with incidents just like inside Bosun, taking actions and checking alert history.

![Incident query](https://raw.githubusercontent.com/bosun-monitor/bosun-grafana-app/master/src/screenshots/incident-query.png)


## External Dependencies

Besides Grafana, the plugin just needs a running Bosun instance. Because Bosun doesn't have support for [CORS headers](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing), it may be easier to make it work in proxy mode.
Bosun also needs a ElasticSearch backend in order for its annotations subsystem to work.
