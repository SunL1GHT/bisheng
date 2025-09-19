
import KnowledgeUploadComponent from "@/components/bs-comp/knowledgeUploadComponent";
import { Button } from "@/components/bs-ui/button";
import { locationContext } from "@/contexts/locationContext";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function FileUploadStep1({ hidden, onNext, onSave,initialFiles }) {
    const { t } = useTranslation('knowledge')
    const { id: kid } = useParams()
    const { appConfig } = useContext(locationContext)

    const [fileCount, setFileCount] = useState(0)
    const [finish, setFinish] = useState(false)
    const filesRef = useRef<any>([])
    const failFilesRef = useRef<any>([])

    const handleFileChange = (files, failFiles) => {
        console.log(files,77);
        
        filesRef.current = files.map(file => ({
            ...file,
            suffix: file.fileName.split('.').pop().toLowerCase() || 'txt',
            fileType: ['xlsx', 'xls', 'csv'].includes(file.fileName.split('.').pop().toLowerCase()) ? 'table' : 'file',
            fileId: 0
        }))
        // TODO 提示 failFiles
        failFilesRef.current = failFiles

        setFinish(!failFiles.length)
    }

    const [loading, setLoading] = useState(false)
    const handleSave = async () => {
        const params = {
            knowledge_id: kid,
            file_list: filesRef.current.map(file => ({
                file_path: file.file_path,
                excel_rule: file.fileType === 'file' ? {} : {
                    "append_header": true,
                    "header_end_row": 1,
                    "header_start_row": 1,
                    "slice_length": 10
                }
            })),
            separator: ["\n\n", "\n"],
            separator_rule: ["after", "after"],
            chunk_size: 1000,
            chunk_overlap: 100,
            retain_images: true,
            enable_formula: true,
            force_ocr: true,
            fileter_page_header_footer: true
        }

        setLoading(true)
        await onSave(params)
        setLoading(false)
    }
    useEffect(() => {
        if (initialFiles.length > 0) {
        // 用已有的handleFileChange处理文件（复用原有逻辑，不用重复写）
        handleFileChange(initialFiles, []);
        // 更新文件计数
        setFileCount(initialFiles.length);
        
        }
    }, [initialFiles]);
    return <div className={`relative h-full max-w-[1200px] mx-auto flex flex-col px-10 pt-4 ${hidden ? 'hidden' : ''}`}>
        <KnowledgeUploadComponent
            size={appConfig.uploadFileMaxSize}
            progressClassName='max-h-[460px]'
            onSelectFile={(count) => {
                setFileCount(count)
                setFinish(false)
            }}
            onFileChange={handleFileChange}
            initialFiles={initialFiles}
        />
        <div className="flex justify-end gap-4 mt-8">
            <Button disabled={loading || !finish} variant="outline" onClick={handleSave}>{t("uploadDirectly")}</Button>
            <Button disabled={loading || !finish} onClick={() => onNext(filesRef.current)} >
                {fileCount ? <span>共{fileCount}个文件</span> : null} {t('nextStep')}</Button>
        </div>
    </div>

};
