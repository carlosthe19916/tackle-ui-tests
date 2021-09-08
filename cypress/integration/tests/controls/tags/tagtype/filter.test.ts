/// <reference types="cypress" />

import { login, clickByText, exists, applySearchFilter } from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, button, clearAllFilters, tags, tagtype } from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";

describe("Tag type filter validations", function () {
    before("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/tag-type*").as("getTagtypes");
    });

    it("Tag type filter validations", function () {
        // Navigate to Tags tab
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Enter an existing tag type name substring and apply it as search filter
        var validSearchInput = data.getExistingTagtype();
        applySearchFilter(tagtype, validSearchInput);

        // Assert that tag type row(s) containing the search text is/are displayed
        exists(validSearchInput);

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getTagtypes");

        // Enter a non-existing tag type name substring and apply it as search filter
        var invalidSearchInput = String(data.getRandomNumber(111111, 222222));
        applySearchFilter(tagtype, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });
});
