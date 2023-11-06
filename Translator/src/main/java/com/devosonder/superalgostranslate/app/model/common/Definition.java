package com.devosonder.superalgostranslate.app.model.common;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@JsonPropertyOrder({"text", "updated", "icon", "translations"})
public class Definition {
    public Icon icon;
    public String text;
    public ArrayList<Translation> translations;
    public Long updated;
}
