import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import { Simulate } from "react-addons-test-utils";

import {
  setupContainer,
  findOne,
  findAll,
  nodeText,
  mapNodesProp,
  nodeExists,
  pause
} from "../test-utils";
import SettingsPage from "../../scripts/containers/SettingsPage";


describe("SettingsPage container", () => {
  var sandbox, comp;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const props = {params: {name: ""}};
    comp = setupContainer(<SettingsPage {...props} />);
    sandbox.stub(global, "fetch").returns(Promise.resolve({
      json() {return {a: 1};}
    }));
  });

  afterEach(() => {
    localStorage.removeItem("kwac_settings");
    sandbox.restore();
  });

  it("should render page title", () => {
    expect(nodeText(comp, "h1")).eql("Settings");
  });

  it("should render a form", () => {
    expect(nodeExists(comp, "form.rjsf")).eql(true);
  });

  it("should fill form with default settings", () => {
    expect(mapNodesProp(comp, "input[type=text]", "value"))
      .eql(["https://kinto.dev.mozaws.net/v1", "default", "user", "pass"]);
  });

  it("should save settings", () => {
    const setItem = sandbox.stub(localStorage, "setItem");
    const inputs = findAll(comp, "input[type=text]");
    const newValues = [
      "http://other.server/v1",
      "otherBucket",
      "newUsername",
      "newPassword",
    ];

    inputs.forEach((input, index) => {
      Simulate.change(input, {
        target: {value: newValues[index]}
      });
    });

    Simulate.submit(findOne(comp, "form"));

    const args = setItem.firstCall.args;
    expect(args[0]).eql("kwac_settings");
    expect(JSON.parse(args[1])).eql({
      server: "http://other.server/v1",
      username: "newUsername",
      password: "newPassword",
      bucket: "otherBucket",
    });
  });

  it("should not render server information initially", () => {
    expect(nodeExists(comp, ".server-info")).eql(false);
  });

  it("should render server information once form is saved", () => {
    Simulate.submit(findOne(comp, "form"));

    return pause()
      .then(() => {
        expect(nodeExists(comp, ".server-info")).eql(true);
      });
  });

  it("should render expected server information", () => {
    Simulate.submit(findOne(comp, "form"));

    return pause()
      .then(() => {
        expect(JSON.parse(nodeText(comp, ".server-info pre"))).eql({a: 1});
      });
  });
});
