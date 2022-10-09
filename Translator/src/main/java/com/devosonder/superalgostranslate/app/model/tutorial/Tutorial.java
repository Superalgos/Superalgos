package com.devosonder.superalgostranslate.app.model.tutorial;

import com.devosonder.superalgostranslate.app.model.common.Definition;
import com.devosonder.superalgostranslate.app.model.common.Paragraph;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@JsonPropertyOrder({"tutorial", "pageNumber", "type", "definition", "paragraphs"})
public class Tutorial {
    public String tutorial;
    public String pageNumber;
    public String type;
    public Definition definition;
    public ArrayList<Paragraph> paragraphs;
}
