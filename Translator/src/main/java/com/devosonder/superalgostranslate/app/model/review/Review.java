package com.devosonder.superalgostranslate.app.model.review;

import com.devosonder.superalgostranslate.app.model.common.Definition;
import com.devosonder.superalgostranslate.app.model.common.Paragraph;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
@JsonPropertyOrder({"review", "pageNumber", "type", "definition", "paragraphs"})
public class Review {
    public String review;
    public String pageNumber;
    public String type;
    public Definition definition;
    public ArrayList<Paragraph> paragraphs;
}
