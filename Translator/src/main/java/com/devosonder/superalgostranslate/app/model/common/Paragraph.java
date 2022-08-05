package com.devosonder.superalgostranslate.app.model.common;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@JsonPropertyOrder({"style", "text", "updated", "translations"})
public class Paragraph {
    public String style;
    public String text;
    public ArrayList<Translation> translations;
    public Long updated;
}
