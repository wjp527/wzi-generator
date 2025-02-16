package ${basePackage}.model;

import lombok.Data;

<#--宏定义-->
<#macro generateModel indent modelInfo>
<#if modelInfo.description??>
${indent}/**
${indent} * ${modelInfo.description}
${indent} */
</#if>
${indent}public ${modelInfo.type} ${modelInfo.fieldName}<#if modelInfo.defaultValue??> = ${modelInfo.defaultValue?c}</#if>;

</#macro>

/**
 * 数据模型
 */
@Data
public class DataModel {

    /**
     * 让我们先明确几个动态生成的需求
     *
     * 1. 在代码开头增加作者 `@Author` 注释 (`增加`代码)
     * 2. 修改程序输出的信息提示 (`替换`代码)
     * 3. 将循环读取输入 改为 单次读取 (`可选`代码)
     */

<#list modelConfig.models as modelInfo>
    <#--有分组-->
    <#if modelInfo.groupKey??>
    /**
     * ${modelInfo.groupName}
     */
    public ${modelInfo.type} ${modelInfo.groupKey} = new ${modelInfo.type}();


    /**
     * ${modelInfo.description}
     */
    @Data
    public static class ${modelInfo.type} {
    <#list modelInfo.models as modelInfo>
        <@generateModel indent="        " modelInfo=modelInfo />
    </#list>

    }
    <#else>
         <@generateModel indent="    " modelInfo=modelInfo />
    </#if>
</#list>
}
