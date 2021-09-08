/// <reference types="cypress" />

import { login, exists, notExists } from "../../../../../utils/utils";
import { Tagtype, Tag } from "../../../../models/tags";

import * as data from "../../../../../utils/data_utils";
import { color, rank, tagCount } from "../../../../types/constants";

describe("Tag Type CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/tag-type*").as("postTagtype");
        cy.intercept("GET", "/api/application-inventory/tag-type*").as("getTagtypes");
        cy.intercept("PUT", "/api/application-inventory/tag-type/*").as("putTagtype");
        cy.intercept("DELETE", "/api/application-inventory/tag-type/*").as("deleteTagtype");
    });

    it("Tag type CRUD", function () {
        // Create new tag type
        const tagtype = new Tagtype(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagtype.create();
        cy.wait("@postTagtype");
        exists(tagtype.name);

        // Edit the tag type name, rank and color
        var updatedTagtype = data.getRandomWord(8);
        var updatedRank = data.getRandomNumber(10, 30);
        var updatedColor = data.getColor();
        tagtype.edit({ name: updatedTagtype, rank: updatedRank, color: updatedColor });
        cy.wait("@putTagtype");
        cy.wait(2000);

        // Assert that tag type name got updated
        exists(updatedTagtype);

        // Assert that rank got updated
        tagtype.assertColumnValue(rank, updatedRank);

        // Assert that color got updated
        tagtype.assertColumnValue(color, updatedColor);

        // Delete tag type
        tagtype.delete();
        cy.wait("@deleteTagtype");
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagtype.name);
    });

    it("Tag type CRUD with member (tags)", function () {
        // Create new tag type
        const tagtype = new Tagtype(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagtype.create();
        cy.wait("@postTagtype");
        exists(tagtype.name);

        var tagList: Array<Tag> = [];

        // Create multiple tags within the tag type created above
        for (let i = 0; i < 2; i++) {
            const tag = new Tag(data.getRandomWord(6), tagtype.name);
            tag.create();
            tagList.push(tag);
            cy.wait(2000);
        }

        // Assert the current tag count in tag type
        tagtype.assertColumnValue(tagCount, "2");

        // Delete one of the tag
        tagList[1].delete();

        // Assert that tag count got updated for tag type
        tagtype.assertColumnValue(tagCount, "1");

        // Delete tag type
        tagtype.delete();
        cy.wait("@deleteTagtype");
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagtype.name);
    });
});
