import { announcement } from "./../../main";

type HTMLInputTypes = "text" | "textarea" | "password" | "radio" | "checkbox" | "dropdown" | "color" | "date" | "image" | "file" | "hidden" | "month" | "number" | "range" | "tel" | "time" | "url" | "email" | "search" | "datetime-local" | "header" | "button" | "submitbtn";
export type Data = {
    [key: string]: {
        type: HTMLInputTypes;
        required: boolean;
        description: string;

        hint?: string;
        value?: string;
        descriptionusehtml?: boolean;
        checked?: boolean;
        editable?: boolean;
        options?: {
            value: string;
            text: string;
            checked?: boolean;
            editable?: boolean;
            header?: boolean;
            checkwith?: string[];
            controlledBy?: string[];
        }[];

        min?: number | string;
        max?: number | string;
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
        step?: number;
        pattern?: string;
        filetypes?: string[];
        autocapitalize?: string;
        autocomplete?: AutoFill;
        maxlength?: number;
        onclick?: () => void;
        href?: string;
        class?: string;
        target?: "_blank" | "_self" | "_parent" | "_top";
        inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
        disabledkeepbright?: boolean;
        copytext?: { title?: string; text: string };
    };
};

export async function createform(data: Data) {
    let form = document.getElementById("form") as HTMLDivElement;
    form.innerHTML = "";

    type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFormElement | HTMLButtonElement;
    type ExtendedFormElement = FormElement & {
        required: boolean;
    };
    let element: ExtendedFormElement;

    Object.keys(data).forEach((key) => {
        // Create a new div element
        let div = document.createElement("div") as HTMLDivElement;
        div.className = "block";

        if (data[key].type === "header") {
            div.style.display = "block";

            let header = document.createElement("h1") as HTMLHeadingElement;
            header.innerHTML = data[key].value ?? "";
            header.className = "formheader";
            header.id = `header_${key.replace(/\s/g, "")}`;

            let headerdescription = document.createElement("p") as HTMLParagraphElement;
            if (data[key].descriptionusehtml) {
                header.innerHTML = data[key].value ?? "";
                headerdescription.innerHTML = data[key].description ?? "";
            } else {
                header.textContent = data[key].value ?? "";
                headerdescription.textContent = data[key].description ?? "";
            }
            headerdescription.className = "headerdescription";

            div.appendChild(header);
            div.appendChild(headerdescription);
            // Wrap the onclick assignment in an IIFE to capture the current state of `element`
            (function (currentElement) {
                div.onclick = function () {
                    currentElement.focus();
                };
            })(header);
            // Append the div to the form
            form.appendChild(div);
            return;
        } else if (data[key].type === "submitbtn") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "submit";
            element.innerHTML = data[key].value ?? "Submit";
            element.className = "submitbtn";
            element.onclick = data[key].onclick ?? function () {};
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;

            form.appendChild(document.createElement("br") as HTMLBRElement);
            form.appendChild(element);
            return;
        }

        // Create a new label element
        let label = document.createElement("label") as HTMLLabelElement;
        // label.for = key.replace(/_/g, ' ');
        label.innerHTML = key.replace(/_/g, " ");
        label.className = "inputlabel";

        // Create a new description element
        let description = document.createElement("p") as HTMLParagraphElement;
        if (data[key]?.descriptionusehtml) {
            description.innerHTML = data[key]?.description ?? "";
        } else {
            description.textContent = data[key]?.description ?? "";
        }
        description.id = `description_${key}`;
        description.className = "description";

        let textdiv = document.createElement("div") as HTMLDivElement;
        textdiv.className = "textdiv";
        textdiv.appendChild(label);
        textdiv.appendChild(description);
        div.appendChild(textdiv);

        if (data[key].type === "radio") {
            let radio = document.createElement("div") as HTMLDivElement & { required: boolean };

            data[key].options?.forEach((option) => {
                if (option.header) {
                    let header = document.createElement("h3") as HTMLHeadingElement;
                    header.innerHTML = option.text;
                    header.className = "inputlabel";
                    div.appendChild(header);
                    return;
                }

                let table = document.createElement("table") as HTMLTableElement;
                table.className = "eachradiotable";

                let row = document.createElement("tr") as HTMLTableRowElement;

                // Cell for the label
                let labelCell = document.createElement("td") as HTMLTableCellElement;
                let label = document.createElement("label") as HTMLLabelElement;
                label.innerHTML = option.text;
                label.className = "inputlabel";
                label.htmlFor = `input_${option.value}`; // Ensures clicking the label toggles the radio
                labelCell.appendChild(label);
                row.appendChild(labelCell);

                // Cell for the radio
                let radioCell = document.createElement("td") as HTMLTableCellElement;
                let optionElement = document.createElement("input") as HTMLInputElement;
                optionElement.type = "radio";
                optionElement.value = option.value;
                optionElement.id = `input_${option.value}`;
                optionElement.className = "input radioinput";
                optionElement.checked = option.checked ?? false;
                optionElement.name = key;
                radioCell.appendChild(optionElement);
                row.appendChild(radioCell);

                // Append the row to the table
                table.appendChild(row);
                radio.appendChild(table); // Assuming 'radio' is a container for the table

                table.addEventListener("click", function () {
                    optionElement.click();
                });
                label.addEventListener("click", function () {
                    optionElement.click();
                });

                let hr = document.createElement("hr") as HTMLHRElement;
                radio.appendChild(hr);

                div.appendChild(radio);
            });
            let hrElements = radio.querySelectorAll("hr");
            if (hrElements.length > 0) {
                let lastHr = hrElements[hrElements.length - 1];
                radio.removeChild(lastHr);
            }
            radio.required = data[key].required;

            radio.className += "radioarea geninput";

            radio.required = data[key].required ? true : false;
            if (radio.required) {
                // Create a new span element
                let span = document.createElement("span") as HTMLSpanElement;
                span.textContent = "*";
                span.style.setProperty("color", "red");
                span.className = "required red";
                label.appendChild(span);
            }

            if (data[key].disabledkeepbright) {
                element.classList.add("disabledkeepbright");
            }

            // Append the div to the form
            form.appendChild(div);
            return;
        } else if (data[key].type === "checkbox") {
            let checkbox = document.createElement("div") as HTMLDivElement & { required: boolean };

            data[key].options?.forEach((option) => {
                if (option.header) {
                    let hrElements = checkbox.querySelectorAll("hr");
                    if (hrElements.length > 0) {
                        let lastHr = hrElements[hrElements.length - 1];
                        checkbox.removeChild(lastHr);

                        let hr = document.createElement("hr") as HTMLHRElement;
                        hr.className = "inputheaderbreaker";
                        checkbox.appendChild(hr);
                    }

                    let header = document.createElement("h3") as HTMLHeadingElement;
                    header.textContent = option.text;
                    header.className = "inputbreakertext";
                    checkbox.appendChild(header);
                    return;
                }

                let table = document.createElement("table") as HTMLTableElement;
                table.className = "eachcheckboxtable";

                let row = document.createElement("tr") as HTMLTableRowElement;

                // Cell for the label
                let labelCell = document.createElement("td") as HTMLTableCellElement;
                let label = document.createElement("label") as HTMLLabelElement;
                label.innerHTML = option.text;
                label.className = "inputlabel";
                label.htmlFor = `input_${option.value}`; // Ensures clicking the label toggles the checkbox
                labelCell.appendChild(label);
                row.appendChild(labelCell);

                // Cell for the checkbox
                let checkboxCell = document.createElement("td") as HTMLTableCellElement;
                let optionElement = document.createElement("input") as HTMLInputElement;
                optionElement.type = "checkbox";
                optionElement.value = option.value;
                optionElement.id = `input_${option.value}`;
                optionElement.className = "input checkboxinput";
                optionElement.checked = option.checked ?? false;
                optionElement.disabled = option.editable !== undefined ? !option.editable : false;
                optionElement.name = key;
                // Step 1: Create a Map to hold checkbox elements and their options
                const checkboxOptionsMap = new Map<HTMLInputElement, any>();
                checkboxOptionsMap.set(optionElement, option); // Store the option in the Map

                optionElement.addEventListener("click", function () {
                    if (optionElement.checked) {
                        // Check if the checkbox was checked
                        // Iterate over the 'checkwith' array to check each checkbox's state
                        option.checkwith?.forEach((checkwithOptionValue) => {
                            const checkwithCheckbox = document.getElementById(`input_${checkwithOptionValue}`) as HTMLInputElement;
                            if (checkwithCheckbox) {
                                checkwithCheckbox.checked = true; // Check the checkbox
                            }
                        });
                    } else {
                        // Check if the checkbox was unchecked
                        // Iterate over the 'controlledBy' array to uncheck each checkbox's state
                        option.controlledBy?.forEach((controlledOptionValue) => {
                            const controlledCheckbox = document.getElementById(`input_${controlledOptionValue}`) as HTMLInputElement;
                            if (controlledCheckbox) {
                                controlledCheckbox.checked = false; // Uncheck the checkbox
                            }
                        });
                    }
                });

                checkboxCell.appendChild(optionElement);
                row.appendChild(checkboxCell);

                // Append the row to the table
                table.appendChild(row);
                checkbox.appendChild(table); // Assuming 'checkbox' is a container for the table

                table.addEventListener("click", function () {
                    optionElement.click();
                });
                label.addEventListener("click", function () {
                    optionElement.click();
                });

                let hr = document.createElement("hr") as HTMLHRElement;
                checkbox.appendChild(hr);

                div.appendChild(checkbox);
            });
            let hrElements = checkbox.querySelectorAll("hr");
            if (hrElements.length > 0) {
                let lastHr = hrElements[hrElements.length - 1];
                checkbox.removeChild(lastHr);
            }
            checkbox.required = data[key].required;

            checkbox.className += "checkboxarea geninput";

            checkbox.required = data[key].required ? true : false;
            if (checkbox.required) {
                // Create a new span element
                let span = document.createElement("span") as HTMLSpanElement;
                span.textContent = "*";
                span.style.setProperty("color", "red");
                span.className = "required red";
                label.appendChild(span);
            }

            if (data[key].disabledkeepbright) {
                element.classList.add("disabledkeepbright");
            }

            // Append the div to the form
            form.appendChild(div);
            return;
        } else if (data[key].type === "dropdown") {
            element = document.createElement("select") as HTMLSelectElement;
            data[key].options?.forEach((option) => {
                let optionElement = document.createElement("option") as HTMLOptionElement;
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                element.appendChild(optionElement);
            });

            element.className = "dropdowninput";
            element.value = data[key].value ?? "";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "button") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "button";
            element.value = data[key].value ?? "";
            element.className = "buttoninput";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
            element.onclick =
                data[key].onclick ??
                function () {
                    window.location.href = data[key].href ?? "#";
                };
        } else if (data[key].type === "textarea") {
            element = document.createElement("textarea") as HTMLTextAreaElement;
            element.value = data[key].value ?? "";
            element.placeholder = data[key].hint ?? "";
            element.className = "textarea";
            element.rows = data[key].height ?? 3;
            element.autocapitalize = data[key].autocapitalize ?? "on";
            element.autocomplete = data[key].autocomplete ?? "off";
            element.inputMode = data[key].inputmode ?? "text";
            element.spellcheck = true;
            element.wrap = "soft";
            element.maxLength = data[key].maxlength ?? 1024;
            element.style.resize = "vertical";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "password") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "password";
            element.value = data[key].value ?? "";
            element.placeholder = data[key].hint ?? "";
            element.className = "password";
            element.autocapitalize = data[key].autocapitalize ?? "off";
            element.autocomplete = data[key].autocomplete ?? "off";
            element.inputMode = data[key].inputmode ?? "text";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "color") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "color";
            element.value = data[key].value ?? "#000000";
            element.className = "color";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "date") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "date";
            element.value = data[key].value ?? "";
            element.className = "date";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "file") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "file";
            element.className = "file";
            element.accept = data[key].filetypes?.join(", ") ?? "*/*"; // Turns the array into a string if it exists, otherwise defaults to all file types
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "hidden") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "hidden";
            element.value = data[key].value ?? "";
            element.className = "hidden";
            element.autocapitalize = data[key].autocapitalize ?? "off";
            element.autocomplete = data[key].autocomplete ?? "off";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;

            div.style.display = "none";
        } else if (data[key].type === "month") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "month";
            element.value = data[key].value ?? ""; // YYYY-MM
            element.className = "month";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.autocapitalize = data[key].autocapitalize ?? "off";
            element.autocomplete = data[key].autocomplete ?? "off";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "number") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "number";
            element.value = data[key].value ?? "";
            element.className = "number";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.inputMode = ["numeric", "decimal"].includes(data[key].inputmode ?? "") ? data[key].inputmode ?? "numeric" : "numeric";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "range") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "range";
            element.value = data[key].value ?? "";
            element.className = "range";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "tel") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "tel";
            element.value = data[key].value ?? "";
            element.className = "tel";
            element.pattern = data[key].pattern ?? "";
            element.inputMode = "tel";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "time") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "time";
            element.value = data[key].value ?? "";
            element.className = "time";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "url") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "url";
            element.value = data[key].value ?? "";
            element.className = "url";
            element.pattern = data[key].pattern ?? "";
            element.inputMode = "url";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "email") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "email";
            element.value = data[key].value ?? "";
            element.className = "email";
            element.pattern = data[key].pattern ?? "";
            element.inputMode = "email";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "search") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "search";
            element.value = data[key].value ?? "";
            element.className = "search";
            element.pattern = data[key].pattern ?? "";
            element.inputMode = "search";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else if (data[key].type === "datetime-local") {
            element = document.createElement("input") as HTMLInputElement;
            element.type = "datetime-local";
            element.value = data[key].value ?? "";
            element.className = "datetime-local";
            element.min = `${data[key].min}`;
            element.max = `${data[key].max}`;
            element.step = `${data[key].step}`;
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        } else {
            element = document.createElement("input") as HTMLInputElement;
            element.type = data[key].type;
            element.value = data[key].value ?? "";
            element.placeholder = data[key].hint ?? "";
            element.inputMode = data[key].inputmode ?? "text";
            element.disabled = data[key].editable !== undefined ? !data[key].editable : false;
        }

        element.id = `input_${key.replace(/\s/g, "")}`;
        element.className += data[key].class ? ` ${data[key].class}` : "";
        element.classList.add("input", "geninput");
        element.className = element.className.trim();

        element.required = data[key].required ? true : false;
        if (element.required) {
            // Create a new span element
            let span = document.createElement("span") as HTMLSpanElement;
            span.textContent = "*";
            span.style.setProperty("color", "red");
            span.className = "required red";
            label.appendChild(span);
        }

        // Keeps the element bright and regular color even when disabled
        if (data[key].disabledkeepbright) {
            element.classList.add("disabledkeepbright");
        }

        // Adds a copy button to the element
        if (data[key].copytext) {
            let object: { title: string; text: string } = {
                title: data[key].copytext?.title ?? "Copy",
                text: data[key].copytext?.text ?? "",
            };
            let copyButton = document.createElement("button") as HTMLButtonElement;
            copyButton.textContent = object.title;
            copyButton.className = "copybutton input geninput";
            copyButton.onclick = function () {
                if (object.text) {
                    // Ensure text is defined
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard
                            .writeText(object.text)
                            .then(() => {
                                announcement("Success", "Copied to clipboard", "success", true);
                            })
                            .catch((err) => {
                                console.error("Failed to copy to clipboard: ", err);
                                announcement("Error", `Failed to copy to clipboard: ${err}`, "danger", true);
                            });
                    } else {
                        // Fallback method for older browsers
                        let tempTextArea = document.createElement("textarea");
                        tempTextArea.value = object.text;
                        document.body.appendChild(tempTextArea);
                        tempTextArea.select();
                        try {
                            document.execCommand("copy");
                            announcement("Success", "Copied to clipboard", "success", true);
                        } catch (err) {
                            console.error("Failed to copy to clipboard: ", err);
                            announcement("Error", `Failed to copy to clipboard: ${err}`, "danger", true);
                        }
                        document.body.removeChild(tempTextArea);
                    }
                } else {
                    console.error("Copy text is undefined");
                }
            };

            let copyButtonDiv = document.createElement("div") as HTMLDivElement;
            copyButtonDiv.className = "copybuttondiv";
            element.classList.add("inputhascopybutton");
            copyButtonDiv.appendChild(element);
            copyButtonDiv.appendChild(copyButton);
            div.appendChild(copyButtonDiv);
        } else {
            div.appendChild(element);
        }

        // Wrap the onclick assignment in an IIFE to capture the current state of `element`
        (function (currentElement) {
            div.onclick = function () {
                currentElement.focus();
            };
        })(element);

        // Append the div to the form
        form.appendChild(div);
    });
}
