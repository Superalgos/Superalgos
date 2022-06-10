package com.devosonder.superalgostranslate.app.model.common;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonPropertyOrder({"name", "project"})
public class Icon {
    public String name;
    public String project;
}
