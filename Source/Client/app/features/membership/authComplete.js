/**
 * @description
 * 
 * Read the URL hash fragments and pass them to AngularJS controller in callback function, 
 * based on the value of the fragment (hasLocalAccount) the AngularJS controller will decide to call 
 * end point “/ObtainLocalAccessToken” or display a view named “associate” where it will give the end user 
 * the chance to set preferred username only and then call the endpoint “/RegisterExternal”.
 */

window.common = (function () {
    var common = {};

    common.getFragment = function getFragment() {
        if (window.location.hash.indexOf("#") === 0) {
            return parseQueryString(window.location.hash.substr(1));
        } else {
            return {};
        }
    };

    function parseQueryString(queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    }

    return common;
})();
var fragment = common.getFragment();

if (fragment.state != undefined) {
    window.location.hash = fragment.state || '';
}

if (window.opener != null) {
    window.opener.$windowScope.authCompletedCB(fragment);
    window.close();
}