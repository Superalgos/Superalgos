package com.devosonder.superalgostranslate.app.model.common;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonPropertyOrder({"language", "text", "updated", "style"})
public class Translation {
    public String language;
    public String text;
    public Long updated;
    public String style;
}
