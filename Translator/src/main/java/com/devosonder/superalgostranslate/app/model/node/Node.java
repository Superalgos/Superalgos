package com.devosonder.superalgostranslate.app.model.node;

import com.devosonder.superalgostranslate.app.model.common.Definition;
import com.devosonder.superalgostranslate.app.model.common.Paragraph;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@JsonPropertyOrder({"type", "definition", "paragraphs"})
public class Node {
    public String type;
    public Definition definition;
    public ArrayList<Paragraph> paragraphs;
}
