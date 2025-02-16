import {
  listGeneratorVoByPageFastUsingPost,
  matchGeneratorsUsingPost,
} from '@/services/backend/generatorController';
import { PageContainer, ProFormText, QueryFilter, ProFormSelect } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  List,
  Card,
  Input,
  Tabs,
  TabsProps,
  Typography,
  Avatar,
  Image,
  message,
  Tag,
  InputRef,
  Flex,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';

import '../../index.css';
import { history } from '@umijs/max';
import { COS_HOST } from '@/constants';

dayjs.extend(relativeTime);
// 默认分页参数
const DEFAULT_PAGE_PARAMS = {
  current: 1,
  pageSize: 12,
  searchText: '',
  sortField: 'createTime',
  sortOrder: 'descend',
};

const HomePage: React.FC = () => {
  // 搜索条件
  const [searchParams, setSearchParams] = useState<API.GeneratorQueryRequest>({
    ...DEFAULT_PAGE_PARAMS,
  });

  // 是否要进行加载
  const [loading, setLoading] = useState(false);

  const [dataList, setDataList] = useState<API.GeneratorVO[]>([]);
  const [total, setTotal] = useState(0);

  // 搜索数据
  const doSearch = async () => {
    setLoading(true);
    let res = await listGeneratorVoByPageFastUsingPost(searchParams);
    if (res.code === 0) {
      setDataList(res.data?.records || []);
      setTotal(Number(res.data?.total) || 0);
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };
  // 搜索框
  const searchRef = useRef<InputRef>(null);

  // 随你心动
  const heartBeat = async () => {
    let res = await matchGeneratorsUsingPost({
      num: 12,
    });
    if (res.code === 0) {
      if (res.data) {
        res?.data.map((item) => {
          item.tags = JSON.parse(item.tags || '[]');
          return item;
        });

        setDataList(res.data || []);
        setTotal(Number(res.data) || 0);
      }
    } else {
      message.error(res.message);
    }
  };

  // tabs
  const onChange = (key: string) => {
    if (key === '0') {
      setSearchParams({
        ...DEFAULT_PAGE_PARAMS,
        sortField: 'createTime',
        sortOrder: 'descend',
      });
    }
    if (key === '1') {
      heartBeat();
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '0',
      label: '最新',
      children: '',
    },
    {
      key: '1',
      label: '✨随你心动',
      children: '',
    },
  ];

  // 标签列表
  const tagListView = (tags?: string[]) => {
    if (!tags) {
      return <></>;
    }
    return (
      <div className="mb-4">
        {tags.map((tag: string) => {
          return <Tag key={tag}>{tag}</Tag>;
        })}
      </div>
    );
  };

  useEffect(() => {
    doSearch();
  }, [searchParams]);

  return (
    <PageContainer title={<></>}>
      <Flex
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Input.Search
          ref={searchRef}
          placeholder="请输入内容"
          allowClear
          enterButton="搜索"
          size="large"
          style={{
            width: '40vw',
            minWidth: 320,
          }}
          onSearch={(value: string) => {
            setSearchParams({
              ...DEFAULT_PAGE_PARAMS,
              searchText: value,
            });
          }}
        />
      </Flex>
      <Tabs size="large" defaultActiveKey="最新" items={items} onChange={onChange} />
      <QueryFilter
        span={12}
        defaultCollapsed={false}
        labelWidth="auto"
        labelAlign="left"
        style={{ padding: '16px 0' }}
        split
        onFinish={(values: API.GeneratorQueryRequest) => {
          setSearchParams({
            ...DEFAULT_PAGE_PARAMS,
            // 上面搜索框的值(名称 / 描述)
            searchText: searchRef.current?.input?.value,
            // 标签
            tags: values?.tags,
            // 名称
            name: values?.name,
            // 描述
            description: values?.description,
          });
        }}
      >
        {/*
          这里不设置 mode，是输入不了数据的，而且这里的tags字段要和数据库的字段进行保持一致
        */}
        <ProFormSelect label="标签" name="tags" mode="tags" options={[]} />
        <ProFormText name="name" label="名称" />
        <ProFormText name="description" label="描述" />
      </QueryFilter>

      <List<API.GeneratorVO>
        rowKey="id"
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        pagination={{
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
          onChange(current: number, pageSize: number) {
            setSearchParams({
              ...searchParams,
              current,
              pageSize,
            });
          },
        }}
        dataSource={dataList}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              history.push(`/generator/detail/${item.id}`);
            }}
          >
            <Card
              hoverable
              cover={
                <Image
                  src={COS_HOST + item.picture}
                  alt={item.name}
                  preview={false}
                  style={{ height: '250px', objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={<a>{item.name}</a>}
                description={
                  <Typography.Paragraph
                    ellipsis={{
                      rows: 2,
                      expandable: false, // 如果希望不展开查看更多
                    }}
                    style={{
                      width: 200, // 根据需要调整宽度
                      minHeight: 44,
                    }}
                  >
                    {item.description}
                  </Typography.Paragraph>
                }
              />
              <div>{tagListView(item.tags)}</div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">{dayjs(item.createTime).fromNow()}</span>
                <div>
                  <Avatar size="small" src={COS_HOST + item.user?.userAvatar ?? <UserOutlined />} />
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

export default HomePage;
