---
title:  Test
summary: ""
sidebar: suite_sidebar
permalink: suite-test.html
---

<table class='hierarchyTable'>
  <thead>
    <tr>
      <th><img src='images/icons/crypto-ecosystem.png' alt='icon' /><br />Crypto Ecosystem</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#crypto-exchanges' data-toggle='tooltip' data-original-title='The crypto exchanges node holds, as explicitly stated, exchanges definitions.'><img src='images/icons/crypto-exchanges.png' alt='icon' /><br />Crypto Exchanges</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#crypto-exchange' data-toggle='tooltip' data-original-title='A crypto exchange node holds the definitions of assets and markets in a specific exchange, to be made available to the system.'><img src='images/icons/crypto-exchange.png' alt='icon' /><br />Crypto Exchange</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-fork.png' alt='icon' /></td>
      <td><a href='#exchange-assets' data-toggle='tooltip' data-original-title='The exchange assets node groups the definitions of assets to be made available to the system.'><img src='images/icons/exchange-assets.png' alt='icon' /><br />Exchange Assets</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-line.png' alt='icon' /></td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#asset' data-toggle='tooltip' data-original-title='An asset in a market is a reference to one of the assets listed at the exchange as defined under the exchange assets node. The base asset is the one used to provide a quote&mdash;a price&mdash;for the quoted asset.'><img src='images/icons/asset.png' alt='icon' /><br />Asset</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-fork.png' alt='icon' /></td>
      <td><a href='#exchange-markets' data-toggle='tooltip' data-original-title='The exchange markets node groups the definitions of markets to be made available to the system.'><img src='images/icons/exchange-markets.png' alt='icon' /><br />Exchange Markets</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-line.png' alt='icon' /></td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#market' data-toggle='tooltip' data-original-title='A market is the definition of a pair of assets (i.e.: BTC-USDT) listed as a market in the corresponding exchange.'><img src='images/icons/market.png' alt='icon' /><br />Market</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-line.png' alt='icon' /></td>
      <td> </td>
      <td><img src='images/icons/tree-connector-fork.png' alt='icon' /></td>
      <td><a href='#market-base-asset' data-toggle='tooltip' data-original-title='The market base asset is a reference to one of the assets listed at the exchange as defined under the exchange assets node. It is the asset in the pair used to provide a quote&mdash;a price&mdash;for the quoted asset.'><img src='images/icons/market-base-asset.png' alt='icon' /><br />Market Base Asset</a></td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-line.png' alt='icon' /></td>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#market-quoted-asset' data-toggle='tooltip' data-original-title='The market quoted asset is a reference to one of the assets listed at the exchange as defined under the exchange assets node. It is the asset in the pair for which a quote is given, denominated in the base asset.'><img src='images/icons/market-quoted-asset.png' alt='icon' /><br />Market Quoted Asset</a></td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#exchange-accounts' data-toggle='tooltip' data-original-title='The exchange accounts node groups the different accounts the user may have with the corresponding exchange.'><img src='images/icons/exchange-accounts.png' alt='icon' /><br />Exchange Accounts</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#user-account' data-toggle='tooltip' data-original-title='A user account represents a single account with the corresponding exchange, holding the definitions of user assets, including keys and balances.'><img src='images/icons/user-account.png' alt='icon' /><br />User Account</a></td>
      <td> </td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-fork.png' alt='icon' /></td>
      <td><a href='#user-keys' data-toggle='tooltip' data-original-title='The user keys node groups the various exchange account keys the user may have under the corresponding account with the exchange.'><img src='images/icons/user-keys.png' alt='icon' /><br />User Keys</a></td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-line.png' alt='icon' /></td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#exchange-account-key' data-toggle='tooltip' data-original-title='The exchange account key holds the definition of the key name and secret provided by the corresponding exchange to access the user account via the exchange API.'><img src='images/icons/exchange-account-key.png' alt='icon' /><br />Exchange Account Key</a></td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#user-assets' data-toggle='tooltip' data-original-title='The user assets node groups the assets the user has at the exchange.'><img src='images/icons/user-assets.png' alt='icon' /><br />User Assets</a></td>
      <td> </td>
      <td> </td>
    </tr>
    <tr>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td> </td>
      <td><img src='images/icons/tree-connector-elbow.png' alt='icon' /></td>
      <td><a href='#exchange-account-asset' data-toggle='tooltip' data-original-title='The exchange account asset represents a single asset the user has at the exchange.'><img src='images/icons/exchange-account-asset.png' alt='icon' /><br />Exchange Account Asset</a></td>
      <td> </td>
    </tr>
  </tbody>
</table>


<table class='hierarchyTable'><thead><tr><th><a href='#charting-space' data-toggle='tooltip' data-original-title='{{site.data.charting_space.charting_space}}'><img src='images/icons/charting-space.png' /><br />Charting Space</a></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></thead><tbody>
<tr><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#viewport' data-toggle='tooltip' data-original-title='{{site.data.charting_space.viewport}}'><img src='images/icons/viewport.png' /><br />Viewport</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#time-machine' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_machine}}'><img src='images/icons/time-machine.png' /><br />Time Machine</a></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_scale}}'><img src='images/icons/time-scale.png' /><br />Time Scale</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#rate-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.rate_scale}}'><img src='images/icons/rate-scale.png' /><br />Rate Scale</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-frame-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_frame_scale}}'><img src='images/icons/time-frame-scale.png' /><br />Time Frame Scale</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#timeline-chart' data-toggle='tooltip' data-original-title='{{site.data.charting_space.timeline_chart}}'><img src='images/icons/timeline-chart.png' /><br />Timeline Chart</a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#rate-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.rate_scale}}'><img src='images/icons/rate-scale.png' /><br />Rate Scale</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-fork.png' /></td><td><a href='#time-frame-scale' data-toggle='tooltip' data-original-title='{{site.data.charting_space.time_frame_scale}}'><img src='images/icons/time-frame-scale.png' /><br />Time Frame Scale</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#layers-manager' data-toggle='tooltip' data-original-title='{{site.data.charting_space.layers_manager}}'><img src='images/icons/layers-manager.png' /><br />Layers Manager</a></td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td><td><img src='images/icons/tree-connector-elbow.png' /></td><td><a href='#layer' data-toggle='tooltip' data-original-title='{{site.data.charting_space.layer}}'><img src='images/icons/layer.png' /><br />Layer</a></td><td></td><td></td><td></td><td></td></tr></tbody></table>
